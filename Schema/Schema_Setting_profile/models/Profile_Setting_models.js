const mongoose = require('mongoose');
const { Number } = require('mongoose/lib/schema/index');

const personalInfoSchema = new mongoose.Schema({
 
  personal: [{
    first_name: { type : String },
    last_name: { type : String },
    profile_image: { type : String },
    telephone_number: { type : String },
    mfu_mail: { type : String },
    personal_email: { type : String },
    dateOfbirth: [{
      day: { type: String, require: false },
      month: { type: String, require: false },
      year: { type: String, require: false },
    }],
    first_name_english: { type : String },
    last_name_english: { type : String },
    ethnicity: { type : String },
    nationality: { type : String },
    id_card_passport: { type : String },
    religion: { type : String },
    address_personal: [{
      address: { type: String, require: false },
      province: { type: String, require: false },
      district: { type: String, require: false },
      subDistrict: { type: String, require: false },
      postcode: { type: String, require: false },
    }],
  }],
  education: [{
    education_level: { type : String },
    major: { type : String },
    faculty: { type : String },
    year: { type : Number },
  }],
  father: [{
    father_first_name: { type : String },
    father_last_name: { type : String },
    father_birthdate: [{
      day: { type: String, require: false },
      month: { type: String, require: false },
      year: { type: String, require: false },
    }],
    father_telephone_number: { type : String },
    father_occupation: { type : String },
    father_email: { type : String },
    father_relationship: { type : String },
    father_address: [{
      address: { type: String, require: false },
      province: { type: String, require: false },
      district: { type: String, require: false },
      subDistrict: { type: String, require: false },
      postcode: { type: String, require: false },
    }],
  }],
  mother: [{
    mother_first_name: { type : String },
    mother_last_name: { type : String },
    mother_birthdate: [{
      day: { type: String, require: false },
      month: { type: String, require: false },
      year: { type: String, require: false },
    }],
    mother_telephone_number : { type: String },
    mother_occupation:  { type: String },
    mother_email:{ type : String },
    mother_relationship: { type: String },
    mother_address: [{
      address: { type: String, require: false },
      province: { type: String, require: false },
      district: { type: String, require: false },
      subDistrict: { type: String, require: false },
      postcode: { type: String, require: false },
    }],
  }],
  emergency_contact: [{
    emergency_contact_name: { type : String },
    emergency_contact_relationship: { type : String },
    emergency_contact_telephone_number: { type : String },
  }],

  create_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const PersonalInfo = mongoose.model('PersonalInfo', personalInfoSchema);

module.exports = PersonalInfo;
