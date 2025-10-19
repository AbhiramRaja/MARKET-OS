/* eslint-disable */
// GraphQL mutations for driver portal

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
