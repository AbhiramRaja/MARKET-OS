/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getOrder = /* GraphQL */ `
  query GetOrder($id: ID!) {
    getOrder(id: $id) {
      id
      userId
      customerName
      customerEmail
      customerPhone
      items {
        id
        productId
        name
        price
        quantity
        image
      }
      shippingAddress {
        fullName
        phone
        addressLine1
        addressLine2
        city
        state
        pincode
      }
      subtotal
      deliveryFee
      total
      paymentMethod
      deliveryType
      status
      createdAt
      updatedAt
    }
  }
`;

export const listOrders = /* GraphQL */ `
  query ListOrders(
    $filter: ModelOrderFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listOrders(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userId
        customerName
        customerEmail
        customerPhone
        items {
          id
          productId
          name
          price
          quantity
          image
        }
        shippingAddress {
          fullName
          phone
          addressLine1
          addressLine2
          city
          state
          pincode
        }
        subtotal
        deliveryFee
        total
        paymentMethod
        deliveryType
        status
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
