import mongoose, { Query, Document, Model, Schema } from "mongoose";
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface LoggerAttrs {
  level: string;
  message: string;
  meta: {
    ip_address?: string;
    correlation_id?: string;
    flow_id?: string;
    status_code?: number;
    route?: string;
    method?: string;
    browser_name?: string;
    browser_version?: string;
    os_name?: string;
    os_version?: string;
    device_name?: string;
    device_type?: string;
    resolution?: string;
    user_agent_source?: string;
    request_body?: string;
    request_response?: string;
    request_params?: string;
    application_name?: string;
    description?: string;
  };
  description: string;
}

interface LoggerDoc extends Document {
  level: string;
  message: string;
  meta: {
    ip_address?: string;
    correlation_id?: string;
    flow_id?: string;
    status_code?: number;
    route?: string;
    method?: string;
    browser_name?: string;
    browser_version?: string;
    os_name?: string;
    os_version?: string;
    device_name?: string;
    device_type?: string;
    resolution?: string;
    user_agent_source?: string;
    request_body?: string;
    request_response?: string;
    request_params?: string;
    application_name?: string;
    description?: string;
  };
  description: string;
  createdAt: Date;
  lastUpdatedAt: Date;
  version: number;
  fingerprint?: string; // Add 'fingerprint' field to LoggerDoc
}

interface LoggerModel extends Model<LoggerDoc> {
  build(attrs: LoggerAttrs): Promise<LoggerDoc>;
  searchLogs(options: {
    keyword?: string;
    fromDateTime?: Date;
    toDateTime?: Date;
    page?: number;
    pageSize?: number;
  }): Promise<any>;
}

const LoggerSchema = new Schema<LoggerDoc, LoggerModel>({
  _id: { type: String, default: uuidv4 },
  level: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  meta: {
    type: Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String,
    required: true,
    index: true,
    set: function(value: string) {
      try {
        return JSON.parse(value);
      } catch (err) {
        return value;
      }
    },
    get: function(value: any) {
      return JSON.stringify(value);
    }
  },
  createdAt: { 
    type: Date 
  },
  lastUpdatedAt: { 
    type: Date 
  },
  fingerprint: {
    type: String,
    index: true
   }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

LoggerSchema.set('versionKey', 'version');

LoggerSchema.pre<LoggerDoc>('save', function (next) {
  const meta = this.meta;

  const fingerprintString = (
    (meta.ip_address || '') +
    (meta.browser_name || '') +
    (meta.browser_version || '') +
    (meta.os_name || '') +
    (meta.os_version || '') +
    (meta.device_name || '') +
    (meta.device_type || '') +
    (meta.resolution || '') +
    (meta.user_agent_source || '')
  );

  if (fingerprintString) {
    const fingerprint = crypto.createHash('sha256').update(fingerprintString).digest('hex');
    this.fingerprint = fingerprint;
  } else {
    this.fingerprint = undefined; // or this.fingerprint = '';
  }

  next();
});

LoggerSchema.statics.build = async function (attrs: LoggerAttrs) {
  const logs = new this(attrs);
  return logs.save();
};

LoggerSchema.pre<LoggerDoc>('save', function (next) {
  const date = new Date();
  const currentDate = date.setHours(date.getHours() - 3 + date.getTimezoneOffset() / 60);

  if (!this.createdAt) {
    this.createdAt = new Date(currentDate);
  }

  this.lastUpdatedAt = new Date(currentDate);

  next();
});
LoggerSchema.pre<LoggerDoc>('findOneAndUpdate', function (next) {
  const date = new Date();
  const currentDate = date.setHours(date.getHours() - 3 + date.getTimezoneOffset() / 60);

  this.updateOne({}, { $set: { lastUpdatedAt: new Date(currentDate) } });

  next();
});

LoggerSchema.statics.searchLogs = async function (options: {
  keyword?: string;
  fromDateTime?: Date;
  toDateTime?: Date;
  page?: number;
  pageSize?: number;
}) {
  const {
    keyword,
    fromDateTime,
    toDateTime,
    page = 1,
    pageSize = 10
  } = options;

  const queryBuilder: Query<LoggerDoc[], LoggerDoc> = Logger.find();

  if (keyword) {
    const regex = new RegExp(`${keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}`, "i");
    queryBuilder.where('description').regex(regex);
  }

  if (fromDateTime) {
    queryBuilder.where('createdAt').gte(fromDateTime.getTime());
  }

  if (toDateTime) {
    queryBuilder.where('createdAt').lte(toDateTime.getTime());
  }

  const totalRecordsQuery = Logger.find(queryBuilder.getFilter()).countDocuments();
  const totalRecords = await totalRecordsQuery.exec();

  const totalPages = Math.ceil(totalRecords / pageSize);

  queryBuilder.skip((page - 1) * pageSize).limit(pageSize);

  const logs = await queryBuilder.exec();

  const responseBody = {
    page,
    page_size: logs.length < 25 ? logs.length : pageSize,
    total_pages: totalPages,
    data: logs
  };

  return responseBody;
};

if(!process.env.MONGO_URI_LOGGER_MANAGER || !process.env.APP_SCENARIO_ENVIRONMENT) {
  throw new Error('You should define the environment variables: MONGO_URI_LOGGER_MANAGER and APP_SCENARIO_ENVIRONMENT');
}

const newMongoDBUrl = `${process.env.MONGO_URI_LOGGER_MANAGER}/${process.env.APP_SCENARIO_ENVIRONMENT}?retryWrites=true&w=majority`;
const newMongoose = mongoose.createConnection(newMongoDBUrl);

const Logger = newMongoose.model<LoggerDoc, LoggerModel>('Logger', LoggerSchema);

// Use the schema.plugin() function to add the updateIfCurrentPlugin
Logger.schema.plugin(updateIfCurrentPlugin);

export { Logger };