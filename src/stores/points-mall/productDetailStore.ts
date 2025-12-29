import { create } from "zustand"
import { AddressItem } from "@/services/pointsMall"

// 商品详情 Store
interface ProductDetailState {
  // 状态定义
  productName: string
  price: number
  mainImage: string
  defaultAddress: AddressItem | null
  
  // 方法定义
  setProductName: (name: string | null | undefined) => void
  setPrice: (price: number | null | undefined) => void
  setMainImage: (image: string | null | undefined) => void
  updateProductInfo: (name: string | null | undefined, price: number | null | undefined, mainImage: string | null | undefined) => void
  setDefaultAddress: (address: AddressItem | null) => void
  reset: () => void
}

export const useProductDetailStore = create<ProductDetailState>()((set) => ({
  // 状态初始化
  productName: "暂无商品名称",
  price: 0,
  mainImage: "",
  defaultAddress: null,
  
  // 方法实现
  setProductName: (name) => set({ productName: name ?? "暂无商品名称" }),
  setPrice: (price) => set({ price: price ?? 0 }),
  setMainImage: (image) => set({ mainImage: image ?? "" }),
  updateProductInfo: (name, price, mainImage) => set({
    productName: name ?? "暂无商品名称",
    price: price ?? 0,
    mainImage: mainImage ?? "",
  }),
  setDefaultAddress: (address) => set({ defaultAddress: address }),
  reset: () => set({
    productName: "暂无商品名称",
    price: 0,
    mainImage: "",
    defaultAddress: null,
  }),
}))

