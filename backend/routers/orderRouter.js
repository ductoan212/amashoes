import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import {
  isAdmin,
  isAuth,
  isSellerOrAdmin,
  mailgun,
  payOrderMailTemplate,
} from '../utils.js';

const orderRouter = express.Router();

orderRouter.get(
  '/',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const seller = req.query.seller || '';
    const sellerFilter = seller ? { seller } : {};
    const orders = await Order.find({ ...sellerFilter }).populate(
      'user',
      'name'
    );
    res.send(orders);
  })
);

orderRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);

orderRouter.get(
  '/summary',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
        },
      },
    ]);

    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);

    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);
    res.send({ users, orders, dailyOrders, productCategories });
  })
);

orderRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ meaasge: 'Order Not Found' });
    }
  })
);

orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (req.body.orderItems.length === 0) {
      res.status(400).send({ message: 'Cart is empty' });
    } else {
      const order = new Order({
        seller: req.body.orderItems[0].seller,
        orderItems: req.body.orderItems,
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod,
        itemsPrice: req.body.itemsPrice,
        shippingPrice: req.body.shippingPrice,
        taxPrice: req.body.taxPrice,
        totalPrice: req.body.totalPrice,
        user: req.user._id,
      });
      const createOrder = await order.save();
      res
        .status(201)
        .send({ message: 'New order created', order: createOrder });
    }
  })
);

orderRouter.put(
  '/:id/pay',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'email name'
    );
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };
      const updatedOrder = await order.save();

      mailgun()
        .messages()
        .send(
          {
            from: 'Amashoes <order@amashoes.com>',
            to: `${order.user.name} <${order.user.email}>, ductoan20102000@gmail.com`,
            subject: `New order ${order._id} - AMASHOES`,
            html: payOrderMailTemplate(order),
          },
          (error, body) => {
            if (error) {
              console.log('error', error);
            } else {
              console.log('body', body);
            }
          }
        );

      res.send({ message: 'Order Paid', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

orderRouter.delete(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      const deleteOrder = await order.remove();
      res.send({ message: 'Order Deleted', order: deleteOrder });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

orderRouter.put(
  '/:id/deliver',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();
      res.send({ message: 'Order Delivered', order: updatedOrder });
    } else {
      req.status(404).send({ meaasge: 'Order Not Found' });
    }
  })
);

export default orderRouter;
