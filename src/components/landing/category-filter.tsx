import { Button } from "@/components/ui/button";

type CategoryFilterProps = { categories: Array<{ id: string; name: string }>; selectedCategory: string; onSelect: (categoryId: string) => void };

export function CategoryFilter({ categories, selectedCategory, onSelect }: CategoryFilterProps) {
  return <div className="mb-5 flex gap-2 overflow-auto pb-2" aria-label="Menu categories"><Button type="button" variant={selectedCategory === "all" ? "default" : "secondary"} className="shrink-0 rounded-full" onClick={() => onSelect("all")}>All menu</Button>{categories.map((category) => <Button key={category.id} type="button" variant={selectedCategory === category.id ? "default" : "secondary"} className="shrink-0 rounded-full" onClick={() => onSelect(category.id)}>{category.name}</Button>)}</div>;
}
