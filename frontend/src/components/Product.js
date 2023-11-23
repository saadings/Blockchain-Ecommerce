import React from 'react'
import Rating from './Rating'
import { Link } from 'react-router-dom'
import { Card } from 'react-bootstrap'
import '../styles/product.css'
import { useDispatch } from 'react-redux'
import { listProductDetails } from '../actions/productActions'

const Product = ({ product }) => {
  const dispatch = useDispatch()

  return (
    <Card
      className="mt-3 p-0"
      onClick={() => dispatch(listProductDetails(product))}
    >
      <Link to={`/product/${product.id}`}>
        <Card.Img
          loading="lazy"
          className="product-image"
          src={product.imgUrl}
          variant="top"
          alt={product.name}
        />
      </Link>

      <Card.Body>
        <Link
          to={`/product/${product.id}`}
          style={{ color: 'dimgray', textDecoration: 'none' }}
        >
          <Card.Title className="product-title" as="p">
            <strong>{product.name}</strong>
          </Card.Title>
        </Link>

        <Card.Text as="div">
          {product && product.rating && (
            <Rating
              value={product.rating}
              text={`${product.numReviews} Review${
                product.numReviews > 1 ? 's' : ''
              }`}
            />
          )}
        </Card.Text>

        <Card.Text as="h4">
          ETH{product?.price}
        </Card.Text>
      </Card.Body>
    </Card>
  )
}

export default Product
