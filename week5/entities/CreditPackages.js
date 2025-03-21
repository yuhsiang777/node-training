const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: 'CreditPackage',
  tableName: 'CREDIT_PACKAGE',
  columns: {
    id: {
      primary: true,      // 設定為主鍵
      type: "uuid",       // 主鍵使用UUID
      generated: "uuid",  // 自動生成UUID
      nullable: false,    // 不可為空
    },
    name: {
      type: 'varchar',
      length: 50,
      nullable: false,
      unique: true        // 必須唯一
    },
    credit_amount: {
      type: 'integer',
      nullable: false
    },
    price: {
      type: 'numeric',    // 類型為小數數字
      precision: 10,      // 保留精度和小數位數
      scale: 2,
      nullable: false
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
      name: 'created_at',
      nullable: false
    }
  }
})