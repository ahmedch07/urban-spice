import { Button } from "@/components/ui/button";

type CategoryFilterProps = { categories: Array<{ id: string; name: string }>; selectedCategory: string; onSelect: (categoryId: string) => void };

export function CategoryFilter({ categories, selectedCategory, onSelect }: CategoryFilterProps) {
  return <div className="mb-6 flex gap-2 overflow-auto pb-3" aria-label="Menu categories"><Button type="button" className={selectedCategory === "all" ? "h-9 shrink-0 rounded-full bg-orange-500 px-4 text-[#32170e] shadow-sm hover:bg-orange-400" : "h-9 shrink-0 rounded-full border border-orange-200 bg-white px-4 text-[#6b3422] shadow-sm hover:bg-orange-50"} onClick={() => onSelect("all")}>All menu</Button>{categories.map((category) => <Button key={category.id} type="button" className={selectedCategory === category.id ? "h-9 shrink-0 rounded-full bg-orange-500 px-4 text-[#32170e] shadow-sm hover:bg-orange-400" : "h-9 shrink-0 rounded-full border border-orange-200 bg-white px-4 text-[#6b3422] shadow-sm hover:bg-orange-50"} onClick={() => onSelect(category.id)}>{category.name}</Button>)}</div>;
}
