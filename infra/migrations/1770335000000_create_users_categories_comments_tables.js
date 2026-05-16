/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    name: {
      type: "varchar(255)",
      notNull: true,
    },
    email: {
      type: "varchar(255)",
      notNull: true,
      unique: true,
    },
    password_hash: {
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

  pgm.createTable("categories", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    name: {
      type: "varchar(255)",
      notNull: true,
      unique: true,
    },
    description: {
      type: "text",
      notNull: true,
    },
  });

  pgm.addColumn("posts", {
    category_id: {
      type: "uuid",
      notNull: false,
    },
    user_id: {
      type: "uuid",
      notNull: false,
    },
  });

  pgm.addConstraint("posts", "fk_posts_category", {
    foreignKeys: {
      columns: "category_id",
      references: "categories(id)",
      onDelete: "SET NULL",
    },
  });

  pgm.addConstraint("posts", "fk_posts_user", {
    foreignKeys: {
      columns: "user_id",
      references: "users(id)",
      onDelete: "SET NULL",
    },
  });

  pgm.createTable("comments", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    post_id: {
      type: "uuid",
      notNull: true,
    },
    user_id: {
      type: "uuid",
      notNull: false,
    },
    content: {
      type: "text",
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

  pgm.addConstraint("comments", "fk_comments_post", {
    foreignKeys: {
      columns: "post_id",
      references: "posts(id)",
      onDelete: "CASCADE",
    },
  });

  pgm.addConstraint("comments", "fk_comments_user", {
    foreignKeys: {
      columns: "user_id",
      references: "users(id)",
      onDelete: "SET NULL",
    },
  });

  pgm.sql(`
    INSERT INTO categories (name, description)
    VALUES
      ('JavaScript', 'Dúvidas, dicas e novidades sobre JS.'),
      ('Backend', 'Node.js, APIs, bancos de dados e arquitetura.'),
      ('Frontend', 'React, Next.js, CSS e UI/UX.'),
      ('Carreira', 'Vagas, freelas e crescimento profissional.');
  `);
};

exports.down = (pgm) => {
  pgm.dropTable("comments");
  pgm.dropConstraint("posts", "fk_posts_user");
  pgm.dropConstraint("posts", "fk_posts_category");
  pgm.dropColumns("posts", ["category_id", "user_id"]);
  pgm.dropTable("categories");
  pgm.dropTable("users");
};
