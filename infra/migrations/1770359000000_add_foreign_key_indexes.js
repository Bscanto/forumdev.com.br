/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE INDEX IF NOT EXISTS posts_category_id_idx
      ON posts(category_id);

    CREATE INDEX IF NOT EXISTS posts_user_id_idx
      ON posts(user_id);

    CREATE INDEX IF NOT EXISTS comments_post_id_idx
      ON comments(post_id);

    CREATE INDEX IF NOT EXISTS comments_user_id_idx
      ON comments(user_id);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS comments_user_id_idx;
    DROP INDEX IF EXISTS comments_post_id_idx;
    DROP INDEX IF EXISTS posts_user_id_idx;
    DROP INDEX IF EXISTS posts_category_id_idx;
  `);
};
