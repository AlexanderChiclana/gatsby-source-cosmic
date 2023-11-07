import getCacheID from './getCacheID';

const deleteCacheItem = async (nodeAPIHelpers, options, cacheItemSlug) => {
  const { cache } = nodeAPIHelpers;
  console.log('cache', cache)
  const cacheID = getCacheID(options, cacheItemSlug);
  await cache.del(cacheID);
};

export default deleteCacheItem;
