const {Order,Transport_area} = require("../models");
const { QueryTypes } = require("sequelize");

const getAllshipper = async(req,res) => {
    try {
        const orderList = await Order.sequelize.query(
          "SELECT A.area, A.route, O.id_shipper, O.name, O.phone FROM shippers as O, transport_areas as A where O.id_shipper = A.id_shipper",
          {
            replacements: {},
            type: QueryTypes.SELECT,
            raw: true,
          }
        );
        res.status(200).json({ orderList });
      } catch (error) {
        res.status(500).json({ message: "Đã có lỗi xảy ra!" });
    }
}

module.exports = {
    getAllshipper
}