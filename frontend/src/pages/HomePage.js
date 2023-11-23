import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Product from '../components/Product'
import Paginate from '../components/Paginate'
import { Row, Col } from 'react-bootstrap'
import ProductCarousel from '../components/ProductCarousel'
import Meta from '../components/Meta'
import { listProducts } from '../actions/productActions'
import { refreshLogin, getUserDetails } from '../actions/userActions'
import Message from '../components/Message'
import SearchBox from '../components/SearchBox'
import ProductSkeleton from '../components/ProductSkeleton'
import { blockchainLoader, loadProducts } from '../sol-config/config'
import { initializeBlockchain } from '../actions/blockchainAction'
import Web3 from 'web3'
// import { initializeBlockchain } from './actions/blockchainAction'
// import { blockchainLoader } from './sol-config/config'

const HomePage = ({ match, history }) => {
  const keyword = match.params.keyword // to search for products
  // const pageNumber = Number(match.params.pageNumber) || 1 // current page number in the paginated display
  const [promptVerfication, setPromptVerification] = useState(false) // prompt user to verify email if not yet confirmed
  // const [products, setProducts] = useState(null)
  const [productAvailable, setProductAvailable] = useState(false)
  const dispatch = useDispatch()

  // get the products list, userinfo and user details form the redix store
  const products = useSelector((state) => state?.blockchainData?.products)
  // console.log('🚀 ~ file: HomePage.js:30 ~ HomePage ~ productList', products)
  // const temp = useSelector((state) => state?.productsList)

  // let { loading, error, pages } = temp
  let loading = false
  let error = false
  let pages = null

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const userDetails = useSelector((state) => state.userDetails)
  const contract = useSelector((state) => state?.blockchainData?.contract)
  const { error: userInfoError } = userDetails

  const getProducts = async () => {
    let prods = await loadProducts(contract)
    dispatch(listProducts(prods))
  }
  // useEffect(() => {
  //   // loadProducts(contract)
  //   console.log("here")
  //   getProducts()
  // }, [])

  // fetch the user details
  useEffect(() => {
    userInfo
      ? userInfo.isSocialLogin
        ? dispatch(getUserDetails(userInfo.id))
        : dispatch(getUserDetails('profile'))
      : dispatch(getUserDetails('profile'))
  }, [userInfo, dispatch])

  // refresh token to get new access token if error in user details
  useEffect(() => {
    if (userInfoError && userInfo && !userInfo.isSocialLogin) {
      const user = JSON.parse(localStorage.getItem('userInfo'))
      dispatch(refreshLogin(user?.email))
    }
  }, [userInfoError, dispatch, userInfo])

  // set a state variable to true or false depending on if products is avialable in the state
  useEffect(() => {
    if (products) {
      products.length ? setProductAvailable(true) : setProductAvailable(false)
    }
  }, [products])

  // fetch products from redux store into local state
  // useEffect(() => {
  //   if (productList) {
  //     if (productList.products) setProducts([...productList.products])
  //   }
  // }, [productList])

  // list products based on keyword and pagenumber
  // useEffect(() => {
  // 	dispatch(listProducts(keyword, pageNumber));
  // 	// eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [dispatch, keyword, pageNumber]);

  // check if user needs to be promted about email verification on page load
  useEffect(() => {
    setPromptVerification(
      localStorage.getItem('promptEmailVerfication') === 'true' ? true : false,
    )
  }, [])

  return (
    <>
      <Meta />
      {/* display carousel only on larger screens */}
      {!keyword ? (
        window.innerWidth > 430 && <ProductCarousel />
      ) : (
        <Link className="btn btn-outline btn-outline-primary my-2" to="/">
          Go Back
        </Link>
      )}
      {/* display this search bar on home page on mobile screens */}
      <div className="d-block d-md-none">
        <SearchBox history={history} />
      </div>

      {products ? (
        <>
          <Row>
            {products?.length
              ? products?.map((product) => {
                  return (
                    <Col sm={12} md={6} lg={4} xl={3} key={product.id}>
                      <Product product={product} />
                    </Col>
                  )
                })
              : keyword &&
                !productAvailable && (
                  //   show this only if user has searched for some item and it is not available
                  <Col className="text-center">
                    <div>
                      <i className="far fa-frown" /> No items found for this
                      search query
                    </div>
                    Go Back to the <Link to="/">Home Page</Link>
                  </Col>
                )}
          </Row>
        </>
      ) : (
        loading &&
        products &&
        products.length === 0 && (
          <Row>
            {[1, 2, 3, 4].map((ele) => {
              return (
                <Col sm={12} md={6} lg={4} xl={3} key={ele}>
                  <div>
                    <ProductSkeleton />
                  </div>
                </Col>
              )
            })}
          </Row>
        )
      )}
    </>
  )
}

export default HomePage
