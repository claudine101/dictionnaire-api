const path = require('path')
const fs = require('fs')
const sharp = require('sharp')
const { info } = require('console')

class Upload {
          constructor() {
                    this.destinationPath = path.resolve('./') + path.sep + 'public' + path.sep + 'uploads'
          }

          async upload(image, withThumb = true) {
                    const extname = path.extname(image.name)
                    const fileName = Date.now() + extname
                    const thumbName = path.parse(fileName).name + '_thumb'+ path.extname(fileName)
                    const filePath = this.destinationPath + path.sep + fileName
                    const thumbPath = this.destinationPath + path.sep + thumbName
                    if(!fs.existsSync(this.destinationPath)) {
                              fs.mkdirSync(this.destinationPath, { recursive: true})
                    }
                    try {
                              var thumbInfo = undefined
                              if(withThumb) {
                                        thumbInfo = await sharp(image.data).resize(354, 221, { fit: 'inside'}).toFormat('jpg').toFile(thumbPath)
                              }
                              var fileInfo = await sharp(image.data).resize(500).toFormat(extname.substring(1), { quality: 100 }).toFile(filePath)
                              // var fileInfo = await image.mv(filePath)
                              return {
                                        fileInfo: { ...fileInfo, fileName },
                                        thumbInfo: withThumb ? {...thumbInfo, thumbName } : undefined
                              }
                    } catch (error) {
                              throw error
                    }
          }
}

module.exports = Upload