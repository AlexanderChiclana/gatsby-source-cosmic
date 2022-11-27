import Cosmic from 'cosmicjs';

const pluginOptionsSchema = ({ Joi }) => Joi.object({
  bucketSlug: Joi.string().required().empty()
    .description('Your Cosmic bucket slug.'),
  readKey: Joi.string().required().empty()
    .description('Your Cosmic API read key.'),
  limit: Joi.number().default(500).integer().min(1)
    .description('The number of objects to fetch per request.'),
  depth: Joi.number().optional().integer().min(0)
    .description('The depth of the object tree to fetch.'),
  use_cache: Joi.boolean().optional()
    .description('Set to false for real-time updates. Increases latency of endpoint.'),
  sort: Joi.string().optional()
    .allow(
      'created_at',
      '-created_at',
      'modified_at',
      '-modified_at',
      'random',
      'order',
    )
    .only(),
  status: Joi.string().optional().allow(
    'published',
    'any',
  ).only(),
  objectTypes: Joi.array().optional().items(
    Joi.alternatives().try(
      Joi.string().empty(),
      Joi.object({
        slug: Joi.string().required().empty(),
        query: Joi.object({
          type: Joi.any().forbidden(),
        }).unknown().optional(),
        props: Joi.string().optional().custom((value) => {
          // Check if comma separated string list of props contains id.
          if (value.split(',').includes('id')) return value;
          throw new Error('props must include "id".');
        }, 'props must contain id'),
        limit: Joi.number().optional().integer().min(1),
        depth: Joi.number().optional().integer().min(0),
        use_cache: Joi.boolean().optional(),
        show_metafields: Joi.boolean().optional(),
        sort: Joi.string().optional().valid(
          'created_at',
          '-created_at',
          'modified_at',
          '-modified_at',
          'random',
          'order',
        ),
        status: Joi.string().optional().valid(
          'published',
          'any',
        ),
      }),
    ),
  ),
}).external(async ({ bucketSlug, readKey }) => {
  // Test that the bucket slug and read key are valid & able to connect to Cosmic.
  const api = Cosmic();
  const bucket = api.bucket({
    slug: bucketSlug,
    read_key: readKey,
  });
  try {
    await bucket.getObjectTypes();
  } catch (error) {
    // check the error code to return a more helpful message.
    throw new Error(`There was an issue connecting to Cosmic.\nStatus Code: ${error.status}\nMessage: ${error.message}`);
  }
});

export default pluginOptionsSchema;
