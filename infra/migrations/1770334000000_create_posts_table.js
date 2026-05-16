/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createExtension("pgcrypto", { ifNotExists: true });

  pgm.createTable("posts", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    title: {
      type: "varchar(255)",
      notNull: true,
    },
    content: {
      type: "text",
      notNull: true,
    },
    author: {
      type: "varchar(255)",
      notNull: true,
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("now()"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("now()"),
    },
  });

  pgm.createIndex("posts", "created_at", { direction: "DESC" });
};

exports.down = (pgm) => {
  pgm.dropIndex("posts", "created_at");
  pgm.dropTable("posts");
};
