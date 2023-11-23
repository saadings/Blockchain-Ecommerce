/* eslint-disable array-callback-return */
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Row,
  Col,
  Card,
  Button,
  ListGroup,
  Form,
  FloatingLabel,
} from 'react-bootstrap'
import ImageMagnifier from '../components/ImageMagnifier' // to magnify image on hover
import Rating from '../components/Rating'
import Meta from '../components/Meta'
import Message from '../components/Message'
import '../styles/product-page.css'
import { addItem } from '../actions/cartActions'

const ProductPage = ({ history, match }) => {
  const [quantity, setQuantity] = useState(1)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [allReviews, setAllReviews] = useState([])
  const [showReviewForm, setShowReviewForm] = useState(true) // bool to decide whether to show the review form or not
  const dispatch = useDispatch()

  const productDetails = useSelector((state) => state.productDetails)
  // const productList=useSelector((state)=>state.productList.products);
  // // console.log("🚀 ~ file: ProductPage.js:43 ~ ProductPage ~ productList", productList)
  const { loading, product, error } = productDetails
  //   console.log('🚀 ~ file: ProductPage.js:44 ~ ProductPage ~ product', product)
  // const selectedProd=productList?.find((item)=>item.id===productDetails.id)

  const productCreateReview = useSelector((state) => state.productCreateReview)
  const {
    loading: loadingCreateReview,
    success: successCreateReview,
    error: errorCreateReview,
  } = productCreateReview

  const contract = useSelector((state) => state?.blockchainData?.contract)
  const sender = useSelector((state) => state?.blockchainData?.userAccount)

  const fetchReviews = async () => {
    try {
      let data = await contract?.getReviews(product?.id)
      setAllReviews(data)
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    fetchReviews()

    return () => {
      setAllReviews('')
    }
  }, [])


  // useEffect(() => {
  //   if (allReviews && sender) {

  //     let flag = 0 // to check if this user has already reviewed this product
  //     for (let review of allReviews) {
  //       if (review.user === sender) {
  //         flag = 1
  //         break
  //       }
  //     }
  //     flag ? setShowReviewForm(false) : setShowReviewForm(true)
  //   } else {
  //     setShowReviewForm(true)
  //   }
  // }, [allReviews, sender])

  const handleAddToCart = (e) => {
    dispatch(addItem(product, quantity))
    history.push(`/cart/${match.params.id}?qty=${quantity}`)
  }

  const handleReviewSubmit = async (e) => {
    try {
      await contract.addReview(product?.id, parseInt(rating), review, {
        from: sender,
      })
      window.alert('Review Submitted!!')
      setRating(0)
      setReview('')
    } catch (e) {
      console.log('error adding review: ', e)
    }
  }

  return (
    <>
      <Link className="btn btn-outline-primary my-2" to="/">
        Go Back
      </Link>
      {
        // product && (!product.id || product.id !== match.params.id) ? (
        // 	<Loader />
        // ) : error ? (
        // 	<Message dismissible variant='danger' duration={10}>
        // 		{error}
        // 	</Message>
        // ) :
        product ? (
          <>
            <Meta title={`${product.name}`} />
            <Row>
              <Col md={6}>
                <ImageMagnifier
                  src={product.imgUrl}
                  alt={product.name}
                  title={product.name}
                />
              </Col>
              <Col md={3}>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <h3>{product.name}</h3>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    {product && product.rating && (
                      <Rating
                        value={product.rating}
                        text={`${product.numReviews} Review${
                          product.numReviews > 1 ? 's' : ''
                        }`}
                      />
                    )}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Price: </strong>
                    ETH{' '}
                    {product.price}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Description:</strong> {product.description}
                  </ListGroup.Item>
                </ListGroup>
              </Col>
              <Col md={3}>
                <Card>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <Row>
                        <Col>
                          <strong>Price: </strong>
                        </Col>
                        <Col>
                          ETH{' '}
                          {product.price}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  </ListGroup>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <Row>
                        <Col>
                          <strong>Status: </strong>
                        </Col>
                        <Col>{0 === 0 ? 'In Stock' : 'Out of Stock'}</Col>
                      </Row>
                    </ListGroup.Item>
                    {product.countInStock > 0 && (
                      <ListGroup.Item>
                        <Row>
                          <Col>
                            <strong>Qty:</strong>
                          </Col>
                          <Col>
                            <Form.Control
                              as="select"
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value)}
                            >
                              {/* create as many options as the countInStock */}
                              {[...Array(product.countInStock).keys()].map(
                                (ele) => (
                                  <option key={ele + 1} value={ele + 1}>
                                    {ele + 1}
                                  </option>
                                ),
                              )}
                            </Form.Control>
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    )}
                    <ListGroup.Item>
                      <Row>
                        <Button
                          onClick={handleAddToCart}
                          type="button"
                          className="btn-block btn-lg"
                          disabled={product.countInStock <= 0}
                        >
                          Add To Cart
                        </Button>
                      </Row>
                    </ListGroup.Item>
                  </ListGroup>
                </Card>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <h2 className="mt-3">Reviews</h2>
                {(!allReviews || !allReviews.length) && (
                  <Message variant="secondary">No Reviews Yet</Message>
                )}
                <ListGroup variant="flush">
                  {/* {console.log(
									product.reviews.
								)} */}
                  {allReviews?.map((item, index) => {
                    return (
                      <ListGroup.Item key={index}>
                        <div>
                          <img
                            src="https://nick-intl.mtvnimages.com/uri/mgid:file:gsp:scenic:/international/nickelodeon.com.au/aangs-journey-season-2-576.jpg?quality=0.80"
                            alt={item?.name}
                            className="review-avatar"
                          />
                          <strong>{item?.user}</strong>
                        </div>
                        <Rating value={item?.rating} />
                        <p
                          style={{
                            margin: '0',
                            fontSize: '1.1em',
                          }}
                        >
                          {item?.review}
                        </p>
                      </ListGroup.Item>
                    )
                  })}
                  {!showReviewForm && (
                    <Message dismissible>
                      You have already reviewed this product
                    </Message>
                  )}
                  {showReviewForm && (
                    // {1 && (
                    <>
                      <h2>Write a Customer Review</h2>
                      {errorCreateReview && (
                        <Message dismissible variant="info" duration={10}>
                          {errorCreateReview}
                        </Message>
                      )}
                      <Form>
                        <Form.Group controlId="rating">
                          <Form.Control
                            as="select"
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                          >
                            <option default>Choose Rating</option>
                            <option value="1">1 - Bad</option>
                            <option value="2">2 - Poor</option>
                            <option value="3">3 - Fair</option>
                            <option value="4">4 - Good</option>
                            <option value="5">5 - Excellent</option>
                          </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="comment">
                          <FloatingLabel
                            controlId="commenttext"
                            label="Comment"
                            className="my-3"
                          >
                            <Form.Control
                              as="textarea"
                              placeholder="Leave a comment here"
                              row="3"
                              onChange={(e) => setReview(e.target.value)}
                              value={review}
                            />
                          </FloatingLabel>
                        </Form.Group>
                        <div className="d-grid">
                          <Button onClick={handleReviewSubmit}>
                            Submit Review
                          </Button>
                        </div>
                      </Form>
                    </>
                  )}
                </ListGroup>
              </Col>
            </Row>
          </>
        ) : (
          ''
        )
      }
    </>
  )
}

export default ProductPage
