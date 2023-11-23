import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Row, Col, ListGroup, Image, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import CheckoutStatus from '../components/CheckoutStatus'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { CART_RESET } from '../constants/cartConstants'
import { refreshLogin, getUserDetails } from '../actions/userActions'
import { authenticate } from 'passport'

const PlaceOrderPage = ({ history }) => {
  const dispatch = useDispatch()

  const cart = useSelector((state) => state.cart)
  const { cartItems, shippingAddress, paymentMethod } = cart

  const orderCreate = useSelector((state) => state.orderCreate)
  const { order, loading, success, error } = orderCreate
  const contract = useSelector((state) => state?.blockchainData?.contract)
  const sender = useSelector((state) => state?.blockchainData?.userAccount)
  const [orderSuccess, setOrderSuccess] = useState({ status: false, id: -1 })
  const [orderID, setOrderID] = useState(-1)
  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  // fetch the userinfo from reducx store
  useEffect(() => {
    userInfo
      ? userInfo.isSocialLogin
        ? dispatch(getUserDetails(userInfo.id))
        : dispatch(getUserDetails('profile'))
      : dispatch(getUserDetails('profile'))
  }, [userInfo, dispatch])

  useEffect(() => {
    if (orderID >= 0) {
      localStorage.removeItem('cartItems')
      dispatch({ type: CART_RESET, payload: shippingAddress }) // remove items from cart once paid, but keep the shipping address in store
      history.push(`/order/${orderID}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderID])

  // All prices, tax is randomly  assigned
  cart.itemsPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  )
  cart.totalPrice = cart?.itemsPrice // + cart.taxPrice + cart.shippingPrice

  const handleOrder = async () => {
    try {
      let products = cartItems.map((item) => {
        return {
          id: parseInt(item.id),
          quantity: item.quantity,
        }
      })
      let shippingDetail =
        shippingAddress.address +
        ', ' +
        shippingAddress.city +
        ', ' +
        shippingAddress.country +
        ', ' +
        shippingAddress.postalCode
      console.log('order payload: ', products)

      // const x=0xb1a2bc2ec50000
      // console.log('test',x?.toNumber())
      let ethPrice = cart?.totalPrice * Math.pow(10, 18)
      console.log(
        '🚀 ~ file: PlaceOrderPage.js:72 ~ handleOrder ~ ethPrice',
        ethPrice,
      )
      let resp = await contract.addOrder(products, shippingDetail, {
        from: sender,
        to: contract?.address,
        value: ethPrice,
      })
      console.log('1', resp.logs[0].args[1].toNumber())
      setOrderID(resp.logs[0].args[1].toNumber())
      // console.log('2', resp.logs[0].args[2].toNumber())

      if (resp) {
        setOrderSuccess({
          status: true,
          id: resp?.logs[0]?.args[1]?.toNumber(),
        })
      }
    } catch (e) {
      console.log('🚀Error!', e)
    }
  }
  return (
    <>
      {/* last step in the ckecout process */}
      <CheckoutStatus step1 step2 step3 step4 />
      <Row>
        {loading ? (
          <Loader />
        ) : (
          <>
            <Col md={8}>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h2>Shipping</h2>
                  <p>
                    <strong>Address: </strong> {shippingAddress.address},{' '}
                    {shippingAddress.city}-{shippingAddress.postalCode},{' '}
                    {shippingAddress.country}
                  </p>
                </ListGroup.Item>
                <ListGroup.Item>
                  <h2>Payment Method</h2>
                  <p>
                    <strong>Method: </strong> {paymentMethod}
                  </p>
                </ListGroup.Item>
                <ListGroup.Item>
                  <h2>Cart Items</h2>
                  {cartItems.length !== 0 ? (
                    <ListGroup variant="flush">
                      {cartItems.map((item, idx) => (
                        <ListGroup.Item key={idx}>
                          <Row>
                            <Col md={2}>
                              <Image
                                className="product-image"
                                src={item.imgUrl}
                                alt={item.name}
                                fluid
                                rounded
                              />
                            </Col>
                            <Col>
                              <Link to={`/product/${item.id}`}>
                                {item.name}
                              </Link>
                            </Col>
                            <Col md={4}>
                              {item.quantity} x {item.price} ={' '}
                              {(item.quantity * item.price).toLocaleString(
                                'en-PK',
                                {
                                  maximumFractionDigits: 2,
                                  style: 'currency',
                                  currency: 'PKR',
                                },
                              )}
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <Message>Your cart is empty</Message>
                  )}
                </ListGroup.Item>
              </ListGroup>
            </Col>
            <Col md={4}>
              <Card>
                <ListGroup variant="flush">
                  <ListGroup.Item className="text-center">
                    <h2 className="text-center">Order Summary</h2>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>
                        <strong>Subtotal</strong>
                      </Col>
                      <Col>
                        {Number(cart.itemsPrice).toLocaleString('en-PK', {
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
                        Free
                        {/* {Number(cart.shippingPrice).toLocaleString('en-PK', {
                          maximumFractionDigits: 2,
                          style: 'currency',
                          currency: 'PKR',
                        })} */}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>
                        <strong>Total</strong>
                      </Col>
                      <Col>
                        {Number(cart.totalPrice).toLocaleString('en-PK', {
                          maximumFractionDigits: 2,
                          style: 'currency',
                          currency: 'PKR',
                        })}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                  {error && (
                    <ListGroup.Item>
                      <Message dismissible variant="danger" duration={10}>
                        {error}
                      </Message>
                    </ListGroup.Item>
                  )}
                  <ListGroup.Item className="d-grid gap-2">
                    <Button
                      type="button"
                      size="lg"
                      disabled={!cartItems.length || orderSuccess?.status}
                      onClick={() => {
                        const flag = localStorage.getItem('authenticated')
                        if (flag==='true') {
                          console.log('flag',flag)
                          handleOrder()
                        } else window.alert('Login first!')
                      }}
                    >
                      Place Order
                    </Button>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          </>
        )}
      </Row>
    </>
  )
}

export default PlaceOrderPage
