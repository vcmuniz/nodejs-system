// Domain Entity - Product Types Value Objects
export enum ProductType {
  PHYSICAL = 'PHYSICAL',
  SERVICE = 'SERVICE',
  COURSE = 'COURSE',
  DIGITAL = 'DIGITAL',
  SUBSCRIPTION = 'SUBSCRIPTION',
  EVENT = 'EVENT'
}

// Base Product Data
export interface ProductData {
  id: string;
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
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Type-specific data interfaces
export interface PhysicalProductData {
  stock: number;
  sku?: string;
  weight?: number;
  width?: number;
  height?: number;
  depth?: number;
  variations?: {
    name: string;
    values: string[];
  }[];
}

export interface ServiceProductData {
  duration?: number; // minutos
  scheduling: boolean;
  location?: 'online' | 'presencial' | 'híbrido';
  professionals?: string[];
  extras?: Record<string, any>;
}

export interface CourseProductData {
  platform?: 'hotmart' | 'eduzz' | 'own';
  modules?: number;
  lessons?: number;
  durationHours?: number;
  certificate: boolean;
  accessDays?: number;
  level?: 'iniciante' | 'intermediario' | 'avancado';
  content?: {
    moduleId: string;
    moduleName: string;
    lessons: {
      lessonId: string;
      lessonName: string;
      duration: number;
    }[];
  }[];
}

export interface DigitalProductData {
  fileUrl?: string;
  fileSize?: number; // KB
  fileType?: 'pdf' | 'video' | 'audio' | 'software' | 'other';
  downloadLimit?: number;
  licenseType?: 'single' | 'multiple';
  expirationDays?: number;
}

export interface SubscriptionProductData {
  billingCycle?: 'monthly' | 'quarterly' | 'yearly';
  trialDays?: number;
  maxUsers?: number;
  benefits?: string[];
}

export interface EventProductData {
  eventDate?: Date;
  location?: string;
  capacity?: number;
  ticketsSold: number;
  category?: 'workshop' | 'palestra' | 'show' | 'outros';
}

// Complete Product with type-specific data
export interface CompleteProductData extends ProductData {
  physicalData?: PhysicalProductData;
  serviceData?: ServiceProductData;
  courseData?: CourseProductData;
  digitalData?: DigitalProductData;
  subscriptionData?: SubscriptionProductData;
  eventData?: EventProductData;
}
