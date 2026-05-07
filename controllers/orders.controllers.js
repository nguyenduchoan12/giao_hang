const {Order,Type,Account,Customer,Order_status} = require("../models");
const { QueryTypes } = require("sequelize");



const createOrder = async (req, res) => {
    const { id_customer, id_type,item_fee,phone_receive,address_receive,address_delivery,weight,description,from_latitude,from_longitude,to_latitude,to_longitude } = req.body;
    const date = new Date();
    date.setHours(date.getHours() + 7);
    const shipping = await Type.findOne({
        where: {
            id_type
        }
    });
    let random = getDistanceFromLatLonInKm(
        from_latitude,
        from_longitude,
        to_latitude,
        to_longitude
    );
    if (random < 2) {
        random = random * 5;
      } else if (random >= 2 && random < 5) {
        random = shipping.price * 10 + 5000;
      } else if (random >= 5 && random < 10) {
        random = shipping.price * 8 + 10000;
      } else {
        random = shipping.price * 7;
    }
    random = Math.ceil(random / 1000) * 1000;
    // console.log(random);
    const total  = item_fee + random
    console.log( id_customer, id_type,item_fee,phone_receive,address_receive,address_delivery,weight,description,from_latitude,from_longitude,to_latitude,to_longitude)
    try {
        const newOrder = await Order.create({
        id_customer,
        time_create:date,
        id_type,
        item_fee,
        phone_receive,
        address_receive,
        address_delivery,
        weight,
        description,
        delivery_fee: random,
        total: total,
        status: 0,
      })
      console.log(newOrder.id_order)
      const NewOrderstatus = await Order_status.create({
        id_order: newOrder.id_order
      })
      res.status(201).json({ message: "Tạo mới sản phẩm thành công!" });
    } catch (error) {
      res.status(500).json({ message: "Đã có lỗi xảy ra!" });
    }
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1); // deg2rad below
    const dLon = deg2rad(lon2 - lon1);
    // console.log(dLat, dLon);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    // console.log(distance);
    return distance;
}
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
const getAllOrder = async (req, res) => {
  const {id_order, status} = req.query
  const account = await Account.findOne({
    where: {
      username: req.username
    }
  })
  try {
    if (account.id_role == 1) {
      console.log(req.username)
      //US
      const customer = await Order.sequelize.query(
        "SELECT CU.* FROM customers as CU, accounts as A WHERE A.username = :username AND CU.id_account = A.id_account",
        {
          replacements: { username: `${req.username}` },
          type: QueryTypes.SELECT,
          raw: true,
        }
      );
      if(status){
        if(id_order){
          const orderList = await Order.sequelize.query(
            "SELECT (SELECT name FROM shippers WHERE id_shipper = O.id_shipper) as name_shipper, O.id_order, O.delivery_fee, O.item_fee, O.total, O.address_receive,O.address_delivery,O.status, DATE_FORMAT(O.time_receive, '%d/%m/%Y %H:%i') as time_confirm, DATE_FORMAT(O.time_delivery, '%d/%m/%Y %H:%i') as time_shipper_receive, DATE_FORMAT(O.time_delivered, '%d/%m/%Y %H:%i') as time_shipper_delivered, DATE_FORMAT(O.time_create, '%d/%m/%Y %H:%i') as time_create FROM orders as O WHERE O.id_customer = :id_customer AND O.status = :status AND O.id_order = :id_order ORDER BY O.status DESC",
            {
              replacements: { id_customer: customer[0].id_customer, status, id_order },
              type: QueryTypes.SELECT,
              raw: true,
            }
          );
          res.status(200).json({ orderList });
        }
        else{
          const orderList = await Order.sequelize.query(
            "SELECT (SELECT name FROM shippers WHERE id_shipper = O.id_shipper) as name_shipper, O.id_order, O.phone_receive, O.delivery_fee, O.item_fee, O.total, O.address_receive,O.address_delivery,O.status, DATE_FORMAT(O.time_receive, '%d/%m/%Y %H:%i') as time_confirm, DATE_FORMAT(O.time_delivery, '%d/%m/%Y %H:%i') as time_shipper_receive, DATE_FORMAT(O.time_delivered, '%d/%m/%Y %H:%i') as time_shipper_delivered, DATE_FORMAT(O.time_create, '%d/%m/%Y %H:%i') as time_create FROM orders as O WHERE O.id_customer = :id_customer AND O.status = :status ORDER BY O.status DESC",
            {
              replacements: { id_customer: customer[0].id_customer, status },
              type: QueryTypes.SELECT,
              raw: true,
            }
          );
          res.status(200).json({ orderList });
        }
      }
      else{
        if(id_order){
          const orderList = await Order.sequelize.query(
            "SELECT (SELECT name FROM shippers WHERE id_shipper = O.id_shipper) as name_shipper, O.id_order, O.phone_receive, O.delivery_fee, O.item_fee, O.total, O.address_receive,O.address_delivery,O.status, DATE_FORMAT(O.time_receive, '%d/%m/%Y %H:%i') as time_confirm, DATE_FORMAT(O.time_delivery, '%d/%m/%Y %H:%i') as time_shipper_receive, DATE_FORMAT(O.time_delivered, '%d/%m/%Y %H:%i') as time_shipper_delivered, DATE_FORMAT(O.time_create, '%d/%m/%Y %H:%i') as time_create FROM orders as O WHERE O.id_customer = :id_customer AND O.id_order = :id_order",
            {
              replacements: { id_customer: customer[0].id_customer, id_order },
              type: QueryTypes.SELECT,
              raw: true,
            }
          );
          res.status(200).json({ orderList });
        }
        else{
          const orderList = await Order.sequelize.query(
            "SELECT (SELECT name FROM shippers WHERE id_shipper = O.id_shipper) as name_shipper, O.id_order, O.phone_receive, O.delivery_fee, O.item_fee, O.total, O.address_receive,O.address_delivery,O.status, DATE_FORMAT(O.time_receive, '%d/%m/%Y %H:%i') as time_confirm, DATE_FORMAT(O.time_delivery, '%d/%m/%Y %H:%i') as time_shipper_receive, DATE_FORMAT(O.time_delivered, '%d/%m/%Y %H:%i') as time_shipper_delivered, DATE_FORMAT(O.time_create, '%d/%m/%Y %H:%i') as time_create FROM orders as O WHERE O.id_customer = :id_customer ORDER BY O.status DESC",
            {
              replacements: { id_customer: customer[0].id_customer },
              type: QueryTypes.SELECT,
              raw: true,
            }
          );
          res.status(200).json({ orderList });
        }
      }
    }
    else{
      const staff = await Order.sequelize.query(
        "SELECT S.*, A.id_role FROM staffs as S, accounts as A WHERE A.username = :username AND A.id_account = S.id_account",
        {
          replacements: { username: `${req.username}` },
          type: QueryTypes.SELECT,
          raw: true,
        }
      );
      if(status){
          if(id_order){
            const orderList = await Order.sequelize.query(
              "SELECT (SELECT name FROM shippers WHERE id_shipper = O.id_shipper) as name_shipper, O.id_order, O.phone_receive, O.delivery_fee, O.item_fee, O.total, C.name as name_customer, C.phone, O.address_receive,O.address_delivery, O.description, O.status, DATE_FORMAT(O.time_create, '%d/%m/%Y %H:%i') as time_create, DATE_FORMAT(O.time_receive, '%d/%m/%Y %H:%i') as time_confirm, DATE_FORMAT(O.time_delivery, '%d/%m/%Y %H:%i') as time_shipper_receive, DATE_FORMAT(O.time_delivered, '%d/%m/%Y %H:%i') as time_shipper_delivered, P.name as name FROM orders as O, customers as C, types as P WHERE O.id_customer = C.id_customer AND O.id_type = P.id_type AND O.status = status AND O.id_order = id_order",
              {
                replacements: { id_order, status, id_store: staff[0].id_store },
                type: QueryTypes.SELECT,
                raw: true,
              }
            );
            res.status(200).json({ orderList });
          }
          else{
            const orderList = await Order.sequelize.query(
              "SELECT (SELECT name FROM shippers WHERE id_shipper = O.id_shipper) as name_shipper, O.id_order, O.phone_receive, O.delivery_fee, O.item_fee, O.total, C.name as name_customer, C.phone, O.address_receive,O.address_delivery, O.description, O.status, DATE_FORMAT(O.time_create, '%d/%m/%Y %H:%i') as time_create, DATE_FORMAT(O.time_receive, '%d/%m/%Y %H:%i') as time_confirm, DATE_FORMAT(O.time_delivery, '%d/%m/%Y %H:%i') as time_shipper_receive, DATE_FORMAT(O.time_delivered, '%d/%m/%Y %H:%i') as time_shipper_delivered, P.name as name FROM orders as O, customers as C, types as P WHERE O.id_customer = C.id_customer AND O.id_type = P.id_type AND O.status = status ORDER BY O.time_create DESC, O.status ASC",
              {
                replacements: { status, id_store: staff[0].id_store },
                type: QueryTypes.SELECT,
                raw: true,
              }
            );
            res.status(200).json({ orderList });
          }
        }
      else{
          if(id_order){
            const orderList = await Order.sequelize.query(
              "SELECT (SELECT name FROM shippers WHERE id_shipper = O.id_shipper) as name_shipper, O.id_order, O.phone_receive, O.delivery_fee, O.item_fee, O.total, C.name as name_customer, C.phone, O.address_receive,O.address_delivery, O.description, O.status, DATE_FORMAT(O.time_create, '%d/%m/%Y %H:%i') as time_create, DATE_FORMAT(O.time_receive, '%d/%m/%Y %H:%i') as time_confirm, DATE_FORMAT(O.time_delivery, '%d/%m/%Y %H:%i') as time_shipper_receive, DATE_FORMAT(O.time_delivered, '%d/%m/%Y %H:%i') as time_shipper_delivered, P.name as name FROM orders as O, customers as C, types as P WHERE O.id_customer = C.id_customer AND O.id_type = P.id_type AND O.id_order = :id_order",
              {
                replacements: { id_order, id_store: staff[0].id_store },
                type: QueryTypes.SELECT,
                raw: true,
              }
            );
            res.status(200).json({ orderList });
          }
          else{
            const orderList = await Order.sequelize.query(
              "SELECT (SELECT name FROM shippers WHERE id_shipper = O.id_shipper) as name_shipper, O.id_order, O.phone_receive, O.delivery_fee, O.item_fee, O.total, C.name as name_customer, C.phone, O.address_receive,O.address_delivery, O.description, O.status, DATE_FORMAT(O.time_create, '%d/%m/%Y %H:%i') as time_create, DATE_FORMAT(O.time_receive, '%d/%m/%Y %H:%i') as time_confirm, DATE_FORMAT(O.time_delivery, '%d/%m/%Y %H:%i') as time_shipper_receive, DATE_FORMAT(O.time_delivered, '%d/%m/%Y %H:%i') as time_shipper_delivered, P.name as name FROM orders as O, customers as C, types as P WHERE O.id_customer = C.id_customer AND O.id_type = P.id_type  ORDER BY O.time_create DESC, O.status ASC",
              {
                replacements: { id_store: staff[0].id_store },
                type: QueryTypes.SELECT,
                raw: true,
              }
            );
            res.status(200).json({ orderList });
          }
        }
    } 
  } catch (error) {
    res.status(500).json({ message: "Đã có lỗi xảy ra!" });
  }
};
const getOrderforShipperReceive = async(req, res) => {
  const {id_order} = req.query
  try {
    const shipper = await Order.sequelize.query(
      "SELECT S.* FROM shippers as S, accounts as A WHERE A.username = :username AND S.id_account = A.id_account",
      {
        replacements: { username: `${req.username}` },
        type: QueryTypes.SELECT,
        raw: true,
      }
    );
    console.log(shipper[0].id_shipper)
    // const orderList = await Order.sequelize.query(
    //   "SELECT (SELECT name FROM shippers WHERE id_shipper = O.id_shipper) as name_shipper, O.id_order, O.delivery_fee, O.item_fee, O.total, O.address_receive,O.address_delivery,O.status, DATE_FORMAT(O.time_receive, '%d/%m/%Y %H:%i') as time_confirm, DATE_FORMAT(O.time_delivery, '%d/%m/%Y %H:%i') as time_shipper_receive, DATE_FORMAT(O.time_delivered, '%d/%m/%Y %H:%i') as time_shipper_delivered, DATE_FORMAT(O.time_create, '%d/%m/%Y %H:%i') as time_create FROM orders as O WHERE O.id_shipper = :id_shipper and O.status < 6",
    //   {
    //     replacements: { id_shipper: shipper[0].id_shipper },
    //     type: QueryTypes.SELECT,
    //     raw: true,
    //   }
    // );
    // res.status(200).json({ orderList });
    if(id_order){
      console.log(2)
      const orderList = await Order.sequelize.query(
        "SELECT (SELECT name FROM shippers WHERE id_shipper = O.id_shipper) as name_shipper, O.id_order, O.delivery_fee, O.phone_receive, O.item_fee, O.total, O.address_receive,O.address_delivery,O.status, DATE_FORMAT(O.time_receive, '%d/%m/%Y %H:%i') as time_confirm, DATE_FORMAT(O.time_delivery, '%d/%m/%Y %H:%i') as time_shipper_receive, DATE_FORMAT(O.time_delivered, '%d/%m/%Y %H:%i') as time_shipper_delivered, DATE_FORMAT(O.time_create, '%d/%m/%Y %H:%i') as time_create FROM orders as O WHERE O.id_shipper = :id_shipper AND O.id_order = :id_order ORDER BY O.status DESC",
        {
          replacements: { id_shipper: shipper[0].id_shipper,id_order },
          type: QueryTypes.SELECT,
          raw: true,
        }
      );
      res.status(200).json({ orderList });
    }
    else{
      const orderList = await Order.sequelize.query(
        "SELECT (SELECT name FROM shippers WHERE id_shipper = O.id_shipper) as name_shipper, O.id_order, O.delivery_fee, O.item_fee, O.total, O.address_receive,O.address_delivery,O.status, DATE_FORMAT(O.time_receive, '%d/%m/%Y %H:%i') as time_confirm, DATE_FORMAT(O.time_delivery, '%d/%m/%Y %H:%i') as time_shipper_receive, DATE_FORMAT(O.time_delivered, '%d/%m/%Y %H:%i') as time_shipper_delivered, DATE_FORMAT(O.time_create, '%d/%m/%Y %H:%i') as time_create FROM orders as O WHERE O.id_shipper = :id_shipper and O.status < 6",
        {
          replacements: { id_shipper: shipper[0].id_shipper },
          type: QueryTypes.SELECT,
          raw: true,
        }
      );
      res.status(200).json({ orderList });
    }
  } catch (error) {
    res.status(500).json({ message: "Đã có lỗi xảy ra!" });
  }
};

const getDetailforShipper = async(req, res) =>{
  const {id_order} = req.params
  try {
    const shipper = await Order.sequelize.query(
      "SELECT S.* FROM shippers as S, accounts as A WHERE A.username = :username AND S.id_account = A.id_account",
      {
        replacements: { username: `${req.username}` },
        type: QueryTypes.SELECT,
        raw: true,
      }
    );

    const orderList = await Order.sequelize.query(
      "SELECT (SELECT name FROM shippers WHERE id_shipper = O.id_shipper) as name_shipper, O.id_order, O.delivery_fee, O.phone_receive, O.item_fee, O.total, O.address_receive,O.address_delivery,O.status, DATE_FORMAT(O.time_receive, '%d/%m/%Y %H:%i') as time_confirm, DATE_FORMAT(O.time_delivery, '%d/%m/%Y %H:%i') as time_shipper_receive, DATE_FORMAT(O.time_delivered, '%d/%m/%Y %H:%i') as time_shipper_delivered, DATE_FORMAT(O.time_create, '%d/%m/%Y %H:%i') as time_create FROM orders as O WHERE O.id_shipper = :id_shipper AND O.id_order = :id_order ORDER BY O.status DESC",
      {
        replacements: { id_shipper: shipper[0].id_shipper,id_order },
        type: QueryTypes.SELECT,
        raw: true,
      }
    );
    res.status(200).json({ orderList });
  } catch (error) {
    res.status(500).json({ message: "Đã có lỗi xảy ra!" });
  }
}

const getOrderforShipperDelivery = async(req, res) => {
  const {id_order} = req.query
  try {
    const shipper = await Order.sequelize.query(
      "SELECT S.* FROM shippers as S, accounts as A WHERE A.username = :username AND S.id_account = A.id_account",
      {
        replacements: { username: `${req.username}` },
        type: QueryTypes.SELECT,
        raw: true,
      }
    );
    console.log(shipper[0].id_shipper)
    if(id_order){
      console.log(2)
      const orderList = await Order.sequelize.query(
        "SELECT (SELECT name FROM shippers WHERE id_shipper = O.id_shipper) as name_shipper, O.id_order, O.delivery_fee, O.phone_receive, O.item_fee, O.total, O.address_receive,O.address_delivery,O.status, DATE_FORMAT(O.time_receive, '%d/%m/%Y %H:%i') as time_confirm, DATE_FORMAT(O.time_delivery, '%d/%m/%Y %H:%i') as time_shipper_receive, DATE_FORMAT(O.time_delivered, '%d/%m/%Y %H:%i') as time_shipper_delivered, DATE_FORMAT(O.time_create, '%d/%m/%Y %H:%i') as time_create FROM orders as O WHERE O.id_shipper = :id_shipper AND O.id_order = :id_order ORDER BY O.status DESC",
        {
          replacements: { id_shipper: shipper[0].id_shipper,id_order },
          type: QueryTypes.SELECT,
          raw: true,
        }
      );
      res.status(200).json({ orderList });
    }
    else{
      const orderList = await Order.sequelize.query(
        "SELECT (SELECT name FROM shippers WHERE id_shipper = O.id_shipper) as name_shipper, O.id_order, O.delivery_fee, O.item_fee, O.total, O.address_receive,O.address_delivery,O.status, DATE_FORMAT(O.time_receive, '%d/%m/%Y %H:%i') as time_confirm, DATE_FORMAT(O.time_delivery, '%d/%m/%Y %H:%i') as time_shipper_receive, DATE_FORMAT(O.time_delivered, '%d/%m/%Y %H:%i') as time_shipper_delivered, DATE_FORMAT(O.time_create, '%d/%m/%Y %H:%i') as time_create FROM orders as O WHERE O.id_shipper = :id_shipper and O.status >= 6",
        {
          replacements: { id_shipper: shipper[0].id_shipper },
          type: QueryTypes.SELECT,
          raw: true,
        }
      );
      res.status(200).json({ orderList });
    }
  } catch (error) {
    res.status(500).json({ message: "Đã có lỗi xảy ra!" });
  }
};

const getOrderCustomer =  async(req,res) => {
  const {phone_receive} = req.params
  console.log(phone_receive)
  const orderList = await Order.sequelize.query(
    "SELECT (SELECT name FROM shippers WHERE id_shipper = O.id_shipper) as name_shipper, O.id_order, O.delivery_fee,O.phone_receive,O.item_fee, O.total, O.address_receive,O.address_delivery,O.status, DATE_FORMAT(O.time_receive, '%d/%m/%Y %H:%i') as time_confirm, DATE_FORMAT(O.time_delivery, '%d/%m/%Y %H:%i') as time_shipper_receive, DATE_FORMAT(O.time_delivered, '%d/%m/%Y %H:%i') as time_shipper_delivered, DATE_FORMAT(O.time_create, '%d/%m/%Y %H:%i') as time_create FROM orders as O WHERE O.phone_receive =:phone_receive",
    {
      replacements: {phone_receive},
      type: QueryTypes.SELECT,
      raw: true,
    }
  );
  res.status(200).json({ orderList });
}
const confirmOrder = async (req, res) => {
  const { id_order } = req.params;
  try {
    const order = await Order.findOne({
      where: {
        id_order,
      },
    });
    console.log(order);
    if (order.status == 0) {
      const order_status = await Order_status.findOne({
        where: {
          id_order,
        },
      });
      console.log(order_status);
      const date = new Date();
      date.setHours(date.getHours() + 7);
      order_status.time_confirm = date;
      order.status = 1;
      console.log(date)
      await order_status.save()
      await order.save();
      res.status(201).json({ message: "Xác nhận đơn hàng!" });
    } else {
      res.status(400)
      res.json({ message: "Thao tác thất bại. Đơn hàng đã được xác nhận!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Thao tác thất bại!" });
  }
};

const cancelOrder = async (req, res) => {
  const { id_order } = req.params;
  const { reason } = req.body
  try {
    const order = await Order.findOne({
      where: {
        id_order,
      },
    });
    if (order.status == 0) {
      // const itemListInOrder = await Order.findAll({
      //   where: {
      //     id_order,
      //   },
      // });
      order.status = 2;
      order.reason = reason;
      await order.save();
      res.status(201).json({ message: "đã huỷ đơn hàng!" });
    } else {
      res.status(400)
      res.json({ message: "Thao tác thất bại. Đơn hàng đã được xác nhận!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Thao tác thất bại!" });
  }
};
const cancelOrderforUser = async (req, res) => {
  const { id_order } = req.params;
  try {
    const order = await Order.findOne({
      where: {
        id_order,
      },
    });
    if (order.status == 0) {
      // const itemListInOrder = await Order.findAll({
      //   where: {
      //     id_order,
      //   },
      // });
      order.status = 2;
      await order.save();
      res.status(201).json({ message: "đã huỷ đơn hàng!" });
    } else {
      res.status(400)
      res.json({ message: "Thao tác thất bại. Đơn hàng đã được xác nhận!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Thao tác thất bại!" });
  }
};

const receiveOrder = async (req, res) => {
  const { id_order,id_shipper } = req.params;
  try {
    const order = await Order.findOne({
      where: {
        id_order,
      },
    });
    const order_status = await Order_status.findOne({
      where: {
        id_order,
      },
    });
    if (order.status == 1) {
      // const itemListInOrder = await Order.findAll({
      //   where: {
      //     id_order,
      //   },
      // });
      const date = new Date()
      date.setHours = date.getHours() + 7;
      order_status.time_receive = date;
      order_status.id_shipper_receive = id_shipper
      order.status = 3;
      order.id_shipper = id_shipper;
      await order_status.save()
      await order.save();
      res.status(201).json({ message: "Phân công nhận hàng thành công!" });
    } else {
      res.status(400)
      res.json({ message: "Đơn hàng không thể phân công nhận hàng!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Thao tác thất bại!" });
  }
};

const shipperReceived = async (req, res) => {
  const { id_order} = req.params;
  try {
    const order = await Order.findOne({
      where: {
        id_order,
      },
    });
    const order_status = await Order_status.findOne({
      where: {
        id_order,
      },
    });
    if (order.status == 3) {
      // const itemListInOrder = await Order.findAll({
      //   where: {
      //     id_order,
      //   },
      // });
      const date = new Date()
      date.setHours = date.getHours() + 7;
      order_status.time_received = date;
      order.status = 4;
      await order.save();
      await order_status.save()
      res.status(201).json({ message: "Nhân viên giao hàng đã nhận hàng từ cửa hàng!" });
    } else {
      res.status(400)
      res.json({ message: "Thao tác thất bại!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Thao tác thất bại!" });
  }
};

const wareHoused_order = async (req, res) => {
  const { id_order} = req.params;
  try {
    const order = await Order.findOne({
      where: {
        id_order,
      },
    });
    const order_status = await Order_status.findOne({
      where: {
        id_order,
      },
    });
    if (order.status == 4) {
      // const itemListInOrder = await Order.findAll({
      //   where: {
      //     id_order,
      //   },
      // });
      const date = new Date()
      date.setHours = date.getHours() + 7;
      order_status.time_warehouse = date;
      order.status = 5;
      order.id_shipper = null;
      await order.save();
      await order_status.save()
      res.status(201).json({ message: "Đơn hàng được giao về kho hoàn thành!" });
    } else {
      res.status(400)
      res.json({ message: "Thao tác thất bại!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Thao tác thất bại!" });
  }
};

const delivery_Order = async (req, res) => {
  const { id_order,id_shipper } = req.params;
  try {
    const order = await Order.findOne({
      where: {
        id_order,
      },
    });
    const order_status = await Order_status.findOne({
      where: {
        id_order,
      },
    });
    if (order.status == 5) {
      // const itemListInOrder = await Order.findAll({
      //   where: {
      //     id_order,
      //   },
      // });
      order_status.id_shipper_delivery = id_shipper
      order.id_shipper = id_shipper;
      order.status = 6;
      await order.save();
      await order_status.save()
      res.status(201).json({ message: "Phân công giao hàng thành công!" });
    } else {
      res.status(400)
      res.json({ message: "Đơn hàng không thể phân công giao hàng!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Thao tác thất bại!" });
  }
};

const received_wareHouse = async (req, res) => {
  const { id_order} = req.params;
  try {
    const order = await Order.findOne({
      where: {
        id_order,
      },
    });
    const order_status = await Order_status.findOne({
      where: {
        id_order,
      },
    });
    if (order.status == 6) {
      // const itemListInOrder = await Order.findAll({
      //   where: {
      //     id_order,
      //   },
      // });
      const date = new Date()
      date.setHours = date.getHours() + 7;
      order_status.time_delivery = date;
      order.status = 7;
      await order.save();
      await order_status.save()
      res.status(201).json({ message: "Đã nhận hàng từ kho đi giao!" });
    } else {
      res.status(400)
      res.json({ message: "Thao tác thất bại!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Thao tác thất bại!" });
  }
};
const finished_order = async (req, res) => {
  const { id_order} = req.params;
  try {
    const order = await Order.findOne({
      where: {
        id_order,
      },
    });
    const order_status = await Order_status.findOne({
      where: {
        id_order,
      },
    });
    if (order.status == 7) {
      // const itemListInOrder = await Order.findAll({
      //   where: {
      //     id_order,
      //   },
      // });
      const date = new Date()
      date.setHours = date.getHours() + 7;
      order_status.time_delivered = date;
      order.status = 8;
      order.id_shipper = null;
      await order.save();
      await order_status.save()
      res.status(201).json({ message: "Hoàn thành đơn hàng!" });
    } else {
      res.status(400)
      res.json({ message: "Thao tác thất bại!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Thao tác thất bại!" });
  }
};
const customer_cancelOrder = async (req, res) => {
  const { id_order } = req.params;
  const { reason } = req.body
  try {
    const order = await Order.findOne({
      where: {
        id_order,
      },
    });
    if (order.status == 7) {
      // const itemListInOrder = await Order.findAll({
      //   where: {
      //     id_order,
      //   },
      // });
      order.status = 9;
      order.reason = reason;
      await order.save();
      res.status(201).json({ message: "Hoàn kho đơn hàng!" });
    } else {
      res.status(400)
      res.json({ message: "Thao tác thất bại. Đơn hàng đã được xác nhận!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Thao tác thất bại!" });
  }
};

const wareHoused_orderCancel = async (req, res) => {
  const { id_order} = req.params;
  try {
    const order = await Order.findOne({
      where: {
        id_order,
      },
    });
    if (order.status == 9) {
      // const itemListInOrder = await Order.findAll({
      //   where: {
      //     id_order,
      //   },
      // });
      order.status = 5;
      await order.save();
      res.status(201).json({ message: "Đơn hàng được hoàn về kho!" });
    } else {
      res.status(400)
      res.json({ message: "Thao tác thất bại!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Thao tác thất bại!" });
  }
};

const delivery_CancelOrder = async (req, res) => {
  const { id_order,id_shipper } = req.params;
  try {
    const order = await Order.findOne({
      where: {
        id_order,
      },
    });
    if (order.status == 5) {
      // const itemListInOrder = await Order.findAll({
      //   where: {
      //     id_order,
      //   },
      // });
      order.status = 10;
      order.id_shipper = id_shipper;
      await order.save();
      res.status(201).json({ message: "Phân công hoàn hàng về cửa hàng thành công!" });
    } else {
      res.status(400)
      res.json({ message: "Đơn hàng không thể phân công giao hàng!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Thao tác thất bại!" });
  }
};

const getStatus_order = async(req, res) => {
  const { id_order} = req.params;
  try {
    const orderList = await Order.sequelize.query(
      "SELECT (SELECT status from orders where id_order = :id_order) as status, DATE_FORMAT(Os.time_confirm, '%d/%m/%Y %H:%i') as time_confirm, DATE_FORMAT(Os.time_create, '%d/%m/%Y %H:%i') as time_create, DATE_FORMAT(Os.time_receive, '%d/%m/%Y %H:%i') as time_receive, DATE_FORMAT(Os.time_received, '%d/%m/%Y %H:%i') as time_received, DATE_FORMAT(Os.time_delivery, '%d/%m/%Y %H:%i') as time_delivery, DATE_FORMAT(Os.time_delivered, '%d/%m/%Y %H:%i') as time_delivered, DATE_FORMAT(Os.time_warehouse, '%d/%m/%Y %H:%i') as time_warehouse, Os.id_shipper_delivery, Os.id_shipper_receive   FROM order_statuses as Os  where Os.id_order = :id_order",
      {
        replacements: { id_order },
        type: QueryTypes.SELECT,
        raw: true,
      }
    );
    res.status(200).json({ orderList });
  } catch (error) {
    res.status(500).json({ message: "Thao tác thất bại!" });
  }
}

module.exports ={
    createOrder,
    getAllOrder,
    confirmOrder,
    cancelOrder,
    receiveOrder,
    shipperReceived,
    wareHoused_order,
    delivery_Order,
    received_wareHouse,
    finished_order,
    customer_cancelOrder,
    wareHoused_orderCancel,
    delivery_CancelOrder,
    getOrderCustomer,
    getOrderforShipperReceive,
    getOrderforShipperDelivery,
    cancelOrderforUser,
    getDetailforShipper,
    getStatus_order
}

/* 
  trạng thái đơn hàng
  1. đơn hàng đc xác nhận
  2. đơn hàng bị huỷ
  3. đơn hàng được giao nhận hàng
  4. người giao hàng đã nhận hàng
  5. đơn hàng được giao tới kho
  6. đơn hàng được phân công giao cho khach hàng
  7. nhân viên giao hàng nhận hàng từ kho
  8. nhân viên giao hàng hoàn thành đơn hàng
  9. đơn hàng bị huỷ do khách hàng
  10. phân công hoàn hàng về cửa hàng


*/