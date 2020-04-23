// Update with your config settings.

module.exports = {

  development: {
    client: 'sqlite3',
    connection: {filename: './movie.sqlite'},
    migration: {tableName:'knex_migrations'},
    seeds:{directory:'./seeds'},
    debug:false,
    pool:
    {
      afterCreate:function(conn, cb){ conn.run("PRAGMA foreign_keys=ON", cb);}
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      host:'localhost',
      database: 'movie',
      user:     'postgres',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    },
    seeds:{directory:'./seeds'},
    debug:false
  }

};
