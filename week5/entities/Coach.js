const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: 'Coach',
  tableName: 'COACH',
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
      nullable: false,
    },
    user_id: {
      type: "uuid",
      nullable: false,
      unique: true,
    },
    experience_years: {
      type: "integer",
      nullable: false
    },
    description: {
      type: "text",
      nullable: false
    },
    profile_image_url: {
      type: "varchar",
      length: 2048,
      nullable: true
    },
    created_at: {
      type: 'timestamp',
      nullable: false,
      createDate: true,
    },
    updated_at: {
      type: 'timestamp',
      nullable: false,
      updateDate: true,
    }
  },
  relations: {
    User: {
      target: 'User',
      type: 'one-to-one',
      inverseSide: 'Coach',
      joinColumn: {
        name: 'user_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'coach_user_id_fk'
      }
    }
  }
})