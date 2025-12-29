import { create } from "zustand"
import { AddressItem } from "@/services/pointsMall"

// 商品详情 Store
interface ProductDetailState {
  // 状态定义
  productId: number | null
  productName: string
  price: number
  mainImage: string
  defaultAddress: AddressItem | null
  
  // 方法定义
  setProductId: (id: number | null | undefined) => void
  setProductName: (name: string | null | undefined) => void
  setPrice: (price: number | null | undefined) => void
  setMainImage: (image: string | null | undefined) => void
  updateProductInfo: (id: number | null | undefined, name: string | null | undefined, price: number | null | undefined, mainImage: string | null | undefined) => void
  setDefaultAddress: (address: AddressItem | null) => void
  reset: () => void
}

export const useProductDetailStore = create<ProductDetailState>()((set) => ({
  // 状态初始化
  productId: null,
  productName: "暂无商品名称",
  price: 0,
  mainImage: "",
  defaultAddress: null,
  
  // 方法实现
  setProductId: (id) => set({ productId: id ?? null }),
  setProductName: (name) => set({ productName: name ?? "暂无商品名称" }),
  setPrice: (price) => set({ price: price ?? 0 }),
  setMainImage: (image) => set({ mainImage: image ?? "" }),
  updateProductInfo: (id, name, price, mainImage) => set({
    productId: id ?? null,
    productName: name ?? "暂无商品名称",
    price: price ?? 0,
    mainImage: mainImage ?? "",
  }),
  setDefaultAddress: (address) => set({ defaultAddress: address }),
  reset: () => set({
    productId: null,
    productName: "暂无商品名称",
    price: 0,
    mainImage: "",
    defaultAddress: null,
  }),
}))

