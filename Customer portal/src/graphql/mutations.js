/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createOrder = /* GraphQL */ `
  mutation CreateOrder(
    $input: CreateOrderInput!
    $condition: ModelOrderConditionInput
  ) {
    createOrder(input: $input, condition: $condition) {
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

export const updateOrder = /* GraphQL */ `
  mutation UpdateOrder(
    $input: UpdateOrderInput!
    $condition: ModelOrderConditionInput
  ) {
    updateOrder(input: $input, condition: $condition) {
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

export const deleteOrder = /* GraphQL */ `
  mutation DeleteOrder(
    $input: DeleteOrderInput!
    $condition: ModelOrderConditionInput
  ) {
    deleteOrder(input: $input, condition: $condition) {
      id
      userId
      customerName
      customerEmail
      customerPhone
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
