const ErrorResponse = require("./../utils/errorResponse");
const GeoCoder = require("./../utils/geocoder");

const Bootcamp = require("./../model/Bootcamp");
const asyncHandler = require("./../middleware/async");

// @desc     get all bootcamps
// @route    GET api.v1.bootcamps
// @access   Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;

  //copy od req.query
  const reqQuery = { ...req.query}

  //Fields exclude
  const removeFields =['select', 'sort'];

  //loop over removeFields and delete from reqQuery
  removeFields.forEach(param => delete reqQuery[param])

  //query string
  let queryStr = JSON.stringify(reqQuery);

  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

  //finding resource
  query = Bootcamp.find(JSON.parse(queryStr));

  //Select Fields
  if(req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields)
  }

  //sort
  if(req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy)
  } else {
    query = query.sort('-createdAt')
  }

  const bootcamps = await query;

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});

// @desc     get single bootcamp
// @route    GET api.v1.bootcamps/:id
// @access   Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: bootcamp
  });
});

// @desc     create new bootcamp
// @route    POST api.v1.bootcamps
// @access   Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp
  });
});

// @desc     update  bootcamp
// @route    PUT api.v1.bootcamps/:id
// @access   Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!bootcamp) {
    return res.status(400).json({
      success: false
    });
  }
  res.status(200).json({
    success: true,
    data: bootcamp
  });
});

// @desc     Delete  bootcamp
// @route    DELETE api.v1.bootcamps/:id
// @access   Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    return res.status(400).json({
      success: false
    });
  }
  res.status(200).json({
    success: true,
    data: null
  });
});


// @desc     get bootcamps within a radius
// @route    GET api.v1.bootcamps/radius/:zipcode/:distance
// @access   Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  //Get lat/lng from geocoder
  const loc = await GeoCoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  //cal radius-radians
  //Divide distance by radius of earth
  //earth radius = 6378 km
  const radius = distance / 6378;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] }
    }
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});
