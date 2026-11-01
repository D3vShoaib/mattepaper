import type { ReactNode } from "react"
import {
  useBookshelfSettings,
  normalizeColumns,
} from "@/stores/bookshelf-settings"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Book02Icon,
  BookOpen01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  FilterHorizontalIcon,
  GridViewIcon,
  Layout01Icon,
  ListViewIcon,
  MinusSignIcon,
  PlusSignIcon,
  Settings01Icon,
  Sorting01Icon,
  TextIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "react-router"
import { Button, buttonVariants } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const optionIcons: Record<string, typeof Book02Icon> = {
  List: ListViewIcon,
  Grid: GridViewIcon,
  All: GridViewIcon,
  Unread: Book02Icon,
  Reading: BookOpen01Icon,
  Finished: CheckmarkCircle02Icon,
  "Last read": Clock01Icon,
  Title: TextIcon,
  Author: UserIcon,
  "Date imported": Calendar03Icon,
}

function ChoiceGroup({
  label,
  icon,
  value,
  options,
  onChange,
}: {
  label: string
  icon: ReactNode
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-3 text-xs font-normal text-muted-foreground">
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
      </legend>
      <ButtonGroup aria-label={label} className="w-full">
        {options.map((option) => (
          <Button
            key={option}
            type="button"
            size="lg"
            className="min-w-0 flex-1 font-normal"
            variant={value === option ? "default" : "outline"}
            aria-pressed={value === option}
            onClick={() => onChange(option)}
          >
            <HugeiconsIcon icon={optionIcons[option]} /> {option}
          </Button>
        ))}
      </ButtonGroup>
    </fieldset>
  )
}

function ChoiceSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        <HugeiconsIcon
          icon={label === "Status" ? FilterHorizontalIcon : Sorting01Icon}
          size={16}
        />
        {label}
      </span>
      <Select
        value={value}
        onValueChange={(next) => {
          if (next) onChange(next)
        }}
      >
        <SelectTrigger aria-label={label} className="h-8 w-full">
          <SelectValue>
            <HugeiconsIcon icon={optionIcons[value]} />
            {value}
          </SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              <HugeiconsIcon icon={optionIcons[option]} />
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
export function ViewOptionsDrawer() {
  const filter = useBookshelfSettings((state) => state.filter)
  const sort = useBookshelfSettings((state) => state.sort)
  const layout = useBookshelfSettings((state) => state.layout)
  const columns = useBookshelfSettings((state) => state.columns)
  const setFilter = useBookshelfSettings((state) => state.setFilter)
  const setSort = useBookshelfSettings((state) => state.setSort)
  const setLayout = useBookshelfSettings((state) => state.setLayout)
  const setColumns = useBookshelfSettings((state) => state.setColumns)
  return (
    <Drawer showSwipeHandle>
      <DrawerTrigger
        render={
          <Button variant="outline" size="icon-lg" aria-label="View options" />
        }
      >
        <HugeiconsIcon icon={FilterHorizontalIcon} />
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-2xl overflow-y-auto p-6">
          <DrawerTitle className="sr-only">View options</DrawerTitle>
          <div className="grid grid-cols-2 gap-x-4 gap-y-7">
            <ChoiceSelect
              label="Status"
              value={filter}
              options={["All", "Unread", "Reading", "Finished"]}
              onChange={setFilter}
            />
            <ChoiceSelect
              label="Sort by"
              value={sort}
              options={["Last read", "Title", "Author", "Date imported"]}
              onChange={setSort}
            />
            <ChoiceGroup
              label="Layout"
              icon={<HugeiconsIcon icon={Layout01Icon} size={16} />}
              value={layout}
              options={["List", "Grid"]}
              onChange={setLayout}
            />
            <div>
              <label
                htmlFor="columns"
                className="mb-3 block text-xs text-muted-foreground"
              >
                Number of columns
              </label>
              <ButtonGroup className="w-full">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  aria-label="Decrease columns"
                  disabled={Number(columns) <= 1}
                  onClick={() =>
                    setColumns(String(Math.max(1, (Number(columns) || 1) - 1)))
                  }
                >
                  <HugeiconsIcon icon={MinusSignIcon} />
                </Button>
                <input
                  id="columns"
                  type="number"
                  min="1"
                  max="12"
                  step="1"
                  value={columns}
                  onChange={(event) => setColumns(event.target.value)}
                  onBlur={() => setColumns(normalizeColumns(columns))}
                  className="h-8 min-w-0 flex-1 [appearance:textfield] border-y border-input bg-transparent text-center text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  aria-label="Increase columns"
                  disabled={Number(columns) >= 12}
                  onClick={() =>
                    setColumns(String(Math.min(12, (Number(columns) || 0) + 1)))
                  }
                >
                  <HugeiconsIcon icon={PlusSignIcon} />
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </div>
        <DrawerFooter className="mx-auto w-full max-w-2xl px-6 pb-6">
          <Link
            to="/settings"
            className={`${buttonVariants({ variant: "outline", size: "lg" })} font-normal`}
          >
            <HugeiconsIcon icon={Settings01Icon} /> Settings
          </Link>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
