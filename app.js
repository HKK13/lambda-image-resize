'use strict';

const Promise = require('bluebird');
const sharp = require('sharp');
const AWS = require('aws-sdk');
const _ = require('lodash');
const s3 = new AWS.S3();

const PORT = process.env.PORT;

app.use(require('body-parser').json());

app.post('/resize/', function (req, res) {
  console.log(req.body);
  var formats = req.body.formats;
  var key = 'imgs/test.jpg';
  var bucket = 'kaantest';

  s3.getObject({Bucket: BUCKET, Key: key}).promise()
    .then(function (file) {
      var tasks = [];

      _.forEach(formats, (format) => {
        var xyValues = format.split('x');
        var x = parseInt(xyValues[0]),
            y = parseInt(xyValues[1]);

        var task = sharp(file.Body).resize(x, x)
          .toFormat('jpeg')
          .toBuffer()
          .then(buffer => s3.putObject({
            Body: buffer,
            Bucket: bucket,
            Key: key.split('.')[0] + x + 'x' + y + '.jpg',
            ACL: 'public-read'
          }).promise());


        tasks.push(task)
      });

      Promise.all(tasks)
        .then((task) => {
          res.sendStatus(200);
        });

    })
    .catch(function (err) {
      console.log(err);
      res.sendStatus(500);
    });
});

app.listen(PORT || 3000);
