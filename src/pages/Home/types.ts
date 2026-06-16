export interface EventData {
  id: string
  slug: string
  title?: string
  description?: string
  date?: string
  location?: string
  image_url?: string
}

export interface EventStatus {
  slug?: string
  title?: string
  available?: number
  is_sold_out?: boolean
  currentLot?: {
    name?: string
    price?: number
  }
}
