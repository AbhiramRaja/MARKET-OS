export const onOrderStatusChange = /* GraphQL */ `
  subscription OnOrderStatusChange($sellerId: ID!) {
    onOrderStatusChange(sellerId: $sellerId) {
      orderId
      sellerId
      status
      updatedAt
    }
  }
`;
