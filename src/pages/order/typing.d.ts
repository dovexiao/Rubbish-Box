export interface OrderItemDTO {
  id: number;
  orderAmount: number;
  productName: string;
  mainImage: string;
  currentPrice: number;
  actualPayAmount: number;
  orderTime: string;
  orderNo: string;
  orderStatus: number;
  expressNo?: string;
  productNum: number;
}

export interface OrderDetailDTO {
  id: number;
  orderAmount: number;
  productName: string;
  mainImage: string;
  currentPrice: number;
  actualPayAmount: number;
  orderTime: string;
  orderNo: string;
  orderStatus: number;
  expressNo?: string;
  productNum: number;
  receiverMobile: string;
  receiverName: string;
  receiverAddress: string;
  remark?: string;
}
