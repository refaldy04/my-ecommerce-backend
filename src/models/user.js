const { Schema, default: mongoose } = require('mongoose')
const bcrypt = require('bcrypt')

const UserSchema = Schema(
  {
    name: {
      type: String,
      required: [true, 'is required'],
    },

    email: {
      type: String,
      required: [true, 'is required'],
      unique: true,
      index: true,
      validate: {
        validator: function (str) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(str)
        },
        message: (props) => `${props.value} is not a valid email`,
      },
    },

    password: {
      type: String,
      required: [true, 'is required'],
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    cart: {
      type: Object,
      default: {
        total: 0,
        count: 0,
      },
    },

    notification: {
      type: Array,
      dafault: [],
    },

    orders: [{ type: Schema.Types.ObjectId, ref: 'order' }],
  },

  { minimize: false }
)

UserSchema.static.findByCredentials = async function (email, password) {
  const user = await User.findOne({ email })
  if (!user) {
    throw new Error('invalid credentials')
  }

  const isSamePassword = bcrypt.compareSync(password, user.password)
  if (isSamePassword) {
    return user
  } else {
    throw new Error('invalid credentials')
  }
}

UserSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()
  delete userObject.password
  return userObject
}

UserSchema.pre('save', function (next) {
  const user = this

  if (!user.isModified('password')) return next()

  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err)

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err)

      user.password = hash
      next()
    })
  })
})

UserSchema.pre('remove', function (next) {
  this.model('Order').remove({ Owner: this._id }, next)
})

const User = mongoose.model('User', UserSchema)

module.exports = User
