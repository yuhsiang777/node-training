const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'User',
  tableName: 'USER',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
      nullable: false,
    },
    name: {
      type: 'varchar',
      length: 50,
      nullable: false,
    },
    email: {
      type: 'varchar',
      length: 320, // 長度
      nullable: false, // 是否為空值
      unique: true, // 唯一值
    },
    role: {
      type: 'varchar',
      length: 20,
      nullable: false,
    },
    password: {
      type: 'varchar',
      length: 72,
      nullable: false,
      select: false, // 密碼欄位不顯示
    },
    created_at: {
      type: 'timestamp',
      nullable: false,
      createDate: true, // 自動生成創建時間
    },
    updated_at: {
      type: 'timestamp',
      nullable: false,
      updateDate: true, // 自動更新修改時間
    },
  },
});