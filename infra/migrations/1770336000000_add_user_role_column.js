/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn("users", {
    role: {
      type: "varchar(50)",
      notNull: true,
      default: "user",
    },
  });

  // Ensure existing users (if any) have a role
  pgm.sql("UPDATE users SET role = COALESCE(role, 'user');");
};

exports.down = (pgm) => {
  pgm.dropColumn("users", "role");
};
