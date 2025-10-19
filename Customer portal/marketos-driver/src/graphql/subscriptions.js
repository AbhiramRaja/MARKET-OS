/* eslint-disable */
// GraphQL subscriptions for real-time updates

export const onCreateOrder = /* GraphQL */ `
  subscription OnCreateOrder($filter: ModelSubscriptionOrderFilterInput) {
    onCreateOrder(filter: $filter) {
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

export const onUpdateOrder = /* GraphQL */ `
  subscription OnUpdateOrder($filter: ModelSubscriptionOrderFilterInput) {
    onUpdateOrder(filter: $filter) {
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
