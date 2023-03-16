const Upload = require("../Upload");
const path = require('path')

class UserUpload extends Upload
{
          constructor() {
                    super()
                    this.destinationPath = path.resolve('./') + path.sep + 'public' + path.sep + 'uploads' + path.sep + 'users'
          }
}
module.exports = UserUpload