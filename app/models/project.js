var mongoose = require('mongoose');

var ProjectSchema = new mongoose.Schema({
  tracking: {
    type: String,
    required: true
  },
  customer_info: {
    name: {
      type: String,
      required: true
    },
    address_1: {
      type: String,
      required: true
    },
    address_2: {
      type: String
    },
    address_city: {
      type: String,
      required: true
    },
    address_state: {
      type: String,
      required: true
    },
    address_zip: {
      type: String,
      required: true
    }
  },
  job_name: {
    type: String,
    required: true
  },
  instructions: {
    type: String,
    required: true
  },
  details: [{
    progress: {
      type: String
    },
    worker: {
      type: String
    },
    hours: {
      type: Number
    }
  }],
  due_date: {
    type: Date,
    required: true
  },
  delivery: {
    type: String,
    required: true
  },
  archived: {
    type: Boolean
  },
  notes: {
    type: [String]
  }
},
{
  timestamps: true
})

ProjectSchema.methods.remove = function(callback) {
  this.remove(callback);
}

module.exports = mongoose.model('Project', ProjectSchema);
