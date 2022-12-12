import { startsWith } from 'lodash';

// Separating the direct call to cosmicjs to make testing easier.
const createCosmicFetch = (objectType, bucket) => async (skip = 0) => {
  let findConfig = {
    type: objectType.slug,
  };

  // Create the find config.
  if (objectType.query) {
    findConfig = {
      ...findConfig,
      ...objectType.query,
    };
  }
  const chainRequest = bucket.objects.find(findConfig);

  if (typeof objectType.props === 'string') chainRequest.props(objectType.props);
  if (typeof objectType.limit === 'number' && objectType.limit > 0) chainRequest.limit(objectType.limit);
  if (typeof objectType.depth === 'number' && objectType.depth >= 0) chainRequest.depth(objectType.depth);
  if (typeof objectType.use_cache === 'boolean') chainRequest.useCache(objectType.use_cache);
  if (typeof objectType.sort === 'string') chainRequest.sort(objectType.sort);
  if (typeof objectType.status === 'string') chainRequest.status(objectType.status);
  // console.log(chainRequest.endpoint);
  const result = await chainRequest.skip(skip);

  return result;
};

const calculateRemainingSkips = (total, limit) => {
  const skipArray = [];
  let skip = limit;
  while (skip < total) {
    skipArray.push(skip);
    skip += limit;
  }
  return skipArray;
};

// TODO: Ask for list of error types, add better handling where possible.
const handleCosmicError = (error, reporter, objectType) => {
  if (error && error.status === 404 && startsWith(error.message, 'No objects found for your query')) {
    reporter.warn(`WARNING: No objects found for your query with the following config:\n${JSON.stringify(objectType, null, 2)}\n`);
    return;
  }

  reporter.panic(`ERROR: Problem fetching objects from cosmic.\n${JSON.stringify(error, null, 2)}\n`);
};

export {
  calculateRemainingSkips,
  createCosmicFetch,
  handleCosmicError,
};