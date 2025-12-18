// Port/Interface - Repository Pattern (Hexagonal Architecture)
import { CompleteProductData, ProductType } from '../Product';

export interface CreateProductDTO {
  userId: string;
  businessProfileId?: string;
  categoryId: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  type: ProductType;
  images?: string[];
  metadata?: Record<string, any>;
  isActive?: boolean;
  
  // Type-specific data
  physicalData?: any;
  serviceData?: any;
  courseData?: any;
  digitalData?: any;
  subscriptionData?: any;
  eventData?: any;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  images?: string[];
  metadata?: Record<string, any>;
  isActive?: boolean;
  
  // Type-specific data updates
  physicalData?: any;
  serviceData?: any;
  courseData?: any;
  digitalData?: any;
  subscriptionData?: any;
  eventData?: any;
}

export interface ListProductsFilters {
  userId: string;
  businessProfileId?: string;
  type?: ProductType;
  categoryId?: string;
  isActive?: boolean;
  search?: string; // Busca por nome ou SKU
}

// Repository Interface (Port)
export interface IProductRepository {
  create(data: CreateProductDTO): Promise<CompleteProductData>;
  update(id: string, userId: string, data: UpdateProductDTO): Promise<CompleteProductData>;
  findById(id: string, userId: string): Promise<CompleteProductData | null>;
  findByIdWithTypeData(id: string, userId: string): Promise<CompleteProductData | null>;
  list(filters: ListProductsFilters): Promise<CompleteProductData[]>;
  delete(id: string, userId: string): Promise<void>;
  existsBySku(sku: string, userId: string, excludeId?: string): Promise<boolean>;
}
