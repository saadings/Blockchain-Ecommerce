import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, ListGroup, Image, Card, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { PayPalButton } from 'react-paypal-button-v2' // for paypal payments
import axios from 'axios'
import Message from '../components/Message'
import Loader from '../components/Loader'
import {
  getOrderDetails,
  payOrder,
  deliverOrder,
} from '../actions/orderActions'
import {
  ORDER_PAY_RESET,
  ORDER_DELIVER_RESET,
} from '../constants/orderConstants'
import { savePaymentMethod } from '../actions/cartActions'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { refreshLogin } from '../actions/userActions'
import CheckoutForm from '../components/CheckoutForm' //stripe checkout form
import getDateString from '../utils/getDateString'

const OrderPage = ({ match, history }) => {
  // load stripe

  // for paypal payment
  const [SDKReady, setSDKReady] = useState(false)
  const dispatch = useDispatch()
  const orderID = match.params.id
  const orderDetails = useSelector((state) => state?.orderDetails)
  const { loading, order, error } = orderDetails

  const orderPay = useSelector((state) => state?.orderPay)
  const { loading: loadingPay, success: successPay } = orderPay

  const orderDeliver = useSelector((state) => state?.orderDeliver)
  const { loading: loadingDeliver, success: successDeliver } = orderDeliver

  const userLogin = useSelector((state) => state?.userLogin)
  const { userInfo } = userLogin
  const contract = useSelector((state) => state?.blockchainData?.contract)
  const userAccount = useSelector((state) => state?.blockchainData?.userAccount)
  const userDetails = useSelector((state) => state?.userDetails)
  const { error: userLoginError } = userDetails
  const shippingAddress = useSelector((state) => state.cart.shippingAddress)

  const getOrderDetails = async () => {
    try {
      let resp = await contract?.getOrder(orderID)
      console.log(resp)
    } catch (e) {
      console.log(e)
    }
  }

  // set order to paid or delivered, and fetch updated orders
  useEffect(() => {
    // if (!order || order?._id !== orderID || successPay || successDeliver) {
    // 	if (successPay) dispatch({ type: ORDER_PAY_RESET });
    // 	if (successDeliver) dispatch({ type: ORDER_DELIVER_RESET });
    getOrderDetails(orderID)
    // }
  }, [])

  return (
    <>
      <h2>Your Order with ID {orderID} has been placed</h2>
      <Row>
        <>
          <Col md={8}>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h2>Shipping</h2>
                <p>
                  <strong>Name: </strong>
                  {userAccount}
                </p>
                <p>
                  <strong>Address: </strong> {shippingAddress.address} , 
                  {shippingAddress.city}, {shippingAddress.country},
                  {shippingAddress.postalCode}
                </p>
                <div>
                  {order?.isDelivered ? (
                    <Message variant="success">
                      Delivered at: {getDateString(order?.deliveredAt)}
                    </Message>
                  ) : (
                    <Message variant="success">Expect Delivery Soon</Message>
                  )}
                </div>
              </ListGroup.Item>
              {/* <ListGroup.Item>
                <h2>Payment Method</h2>
                <p>
                  <strong>Method: </strong> {order?.paymentMethod}
                </p>
                <div>
                  {order?.isPaid ? (
                    <Message variant="success">
                      Paid at: {getDateString(order?.paidAt)}
                    </Message>
                  ) : (
                    <Message variant="danger">Not Paid</Message>
                  )}
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <h2>Cart Items</h2>
                {order?.orderItems.length !== 0 ? (
                  <ListGroup variant="flush">
                    <div
                      style={{
                        background: 'red',
                      }}
                    ></div>
                    {order?.orderItems.map((item, idx) => (
                      <ListGroup.Item key={idx}>
                        <Row>
                          <Col md={2}>
                            <Image
                              className="product-image"
                              src={item.image}
                              alt={item.name}
                              fluid
                              rounded
                            />
                          </Col>
                          <Col>
                            <Link to={`/product/${item.product}`}>
                              {item.name}
                            </Link>
                          </Col>
                          <Col md={4}>
                            {item.qty} x {item.price} ={' '}
                            {(item.qty * item.price).toLocaleString('en-PK', {
                              maximumFractionDigits: 2,
                              style: 'currency',
                              currency: 'PKR',
                            })}
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <Message>No order</Message>
                )}
              </ListGroup.Item>*/}
            </ListGroup>
          </Col>
          {/* <Col md={4}>
            <Card>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h2 className="text-center">Order Summary</h2>
                </ListGroup.Item>
                {error && (
                  <ListGroup.Item>
                    <Message dismissible variant="danger" duration={10}>
                      {error}
                    </Message>
                  </ListGroup.Item>
                )}
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong>Subtotal</strong>
                    </Col>
                    <Col>
                      {order?.itemsPrice.toLocaleString('en-PK', {
                        maximumFractionDigits: 2,
                        style: 'currency',
                        currency: 'PKR',
                      })}
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong>Shipping</strong>
                    </Col>
                    <Col>
                      {order?.shippingPrice.toLocaleString('en-PK', {
                        maximumFractionDigits: 2,
                        style: 'currency',
                        currency: 'PKR',
                      })}
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong>Tax</strong>
                    </Col>
                    <Col>
                      {order?.taxPrice.toLocaleString('en-PK', {
                        maximumFractionDigits: 2,
                        style: 'currency',
                        currency: 'PKR',
                      })}
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong>Total</strong>
                    </Col>
                    <Col>
                      {order?.totalPrice.toLocaleString('en-PK', {
                        maximumFractionDigits: 2,
                        style: 'currency',
                        currency: 'PKR',
                      })}
                    </Col>
                  </Row>
                </ListGroup.Item>
                {/* show paypal button or the stripe checkout form */}
          {/* </Col> */}
          {/* */}
        </>
      </Row>
    </>
  )
}

export default OrderPage
