import { Component, createMemo, createSignal } from "solid-js"
import { MenuViewer } from "../lib/MenuViewer"
import { ErrorMessage, FormField } from "../lib/common"
import { ColumnDef, createSolidTable, flexRender, getCoreRowModel } from "@tanstack/solid-table"
import { api, Room, Spare, SpareInitRequest } from "../api"
import { WeekSelect } from "../lib/WeekSelect"
import { addDays, addWeeks, format, formatISODuration, intervalToDuration, parse } from "date-fns"
import { match } from "ts-pattern"
import { Signal } from "../util"
import { Calendar } from "../component/Calendar"

const UserManage: Component = () => {
	// TODO[Early]: Finish this component
	return (
		<div class="ui form">
			<h4 class="ui dividing header"> 修改密码 </h4>
			<div class="inline fields">
				<FormField label="用户名" name="username" />
				<FormField label="新密码" name="password" type="password" />
				<button class="ui button" tabindex="0"> 修改 </button>
			</div>
		</div>
	)
}

const SpareManage: Component = () => {
	// tanstack barely does anything functional
	// but we still use it since it organizes data better	
	// and now I hate it

	// part: form data

	const current_week = new Date()
	const [begin_week, set_begin_week] = createSignal(current_week)
	const [end_week, set_end_week] = createSignal(current_week)
	const [spares_input, set_spares_input] = createSignal<SpareInput[]>([])
	const [error, set_error] = createSignal<string>()
	type SpareInput = {
		room: Signal<Room>;
		begin_time: Signal<string>; // eg. 8:00, 16:30
		end_time: Signal<string>; // eg. 9:00, 17:30
		weeks: Signal<string>;
	}

	const spares = createMemo(() => {
		const base_date = new Date()
		const parse_time = (day: number, time: string) => formatISODuration(intervalToDuration({
			start: parse("0:00", "H:mm", base_date),
			end: addDays(parse(time, "H:mm", base_date), day),
		}))
		let stamp = 0
		return spares_input().flatMap(spare => spare.weeks.get().split(",").map(
			day => ({
				id: 0,
				stamp: stamp++,
				room: spare.room.get(),
				week: "filled by backend",
				begin_time: parse_time(parseInt(day) - 1, spare.begin_time.get()),
				end_time: parse_time(parseInt(day) - 1, spare.end_time.get()),
				assignee: undefined,
			} as Spare)))
	})
	const rooms = createMemo(() => (
		[...new Set(spares_input().map(spare => spare.room.get()))]
	))



	// part: handlers

	const submit = async () => {
		try {
			const data: SpareInitRequest = {
				weeks: (() => {
					const weeks: string[] = []
					for (let i = begin_week(); i <= end_week(); i = addWeeks(i, 1)) {
						weeks.push(format(i, "RRRR-'W'II"))
					}
					return weeks
				})(),
				rooms: rooms(),
				spares: spares(),
			}
			console.log(data)
			const resp = await api.spare_init(data)
			match(resp.type)
				.with("Success", () => alert("提交成功"))
				.exhaustive()
		} catch (error) {
			set_error("提交失败：" + error)
		}
	}
	
	const delete_row = (index: number) => {
		set_spares_input(spares => spares.filter((_, i) => i !== index))
	}

	const append_row = () => {
		set_spares_input([...spares_input(), {
			room: new Signal(""),
			begin_time: new Signal(""),
			end_time: new Signal(""),
			weeks: new Signal("1,2,3,4,5,6,7")
		}])
	}

	const validate_time = (time: string) => /^([0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(time)
	const validate_weekday = (str: string) => /^([1-7],)*[1-7]$/.test(str)

	// part: table

	const columns: ColumnDef<SpareInput>[] = [
		{
			header: "琴房号",
			accessorKey: "room",
			cell: ({ row, getValue }) => (
				<div class="ui input">
					<input type="text"
						placeholder="205"
						value={(getValue() as Signal<string>).get() as string}
						onChange={(e) => spares_input()[row.index].room.set(e.currentTarget.value)} />
				</div>
			),
		},
		{
			header: "开始时间",
			accessorKey: "begin_time",
			cell: ({ row, getValue }) => (
				<div class="ui input"
					classList={{ error: !validate_time(spares_input()[row.index].begin_time.get()) }}>
					<input type="text"
						placeholder="8:00"
						value={(getValue() as Signal<string>).get() as string}
						onChange={(e) => spares_input()[row.index].begin_time.set(e.currentTarget.value)} />
				</div>
			),
		},
		{
			header: "结束时间",
			accessorKey: "end_time",
			cell: ({ row, getValue }) => (
				<div class="ui input"
					classList={{ error: !validate_time(spares_input()[row.index].end_time.get()) }}>
					<input type="text"
						placeholder="18:30"
						value={(getValue() as Signal<string>).get() as string}
						onChange={(e) => spares_input()[row.index].end_time.set(e.currentTarget.value)} />
				</div>
			),
		},
		{
			header: "周内日期",
			accessorKey: "weeks",
			cell: ({ row, getValue }) => (
				<div class="ui input"
					classList={{ error: !validate_weekday(spares_input()[row.index].weeks.get()) }}>
					<input type="text"
						placeholder="1,2,3,4,5,6,7"
						value={(getValue() as Signal<string>).get() as string}
						onChange={(e) => spares_input()[row.index].weeks.set(e.currentTarget.value)} />
				</div>
			)
		},
		{
			header: "操作",
			cell: ({ row }) => (
				<button class="ui red icon button"
					onClick={() => delete_row(row.index)} >
					<i class="close icon" />
				</button>
			),
		}
	]

	const table = createSolidTable({
		get data() {
			return spares_input()
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
	})

	// part: HTML

	return (
		<>
			<h4> 琴房信息初始化 </h4>
			<div class="ui form">
				<div class="inline fields">
					<div class="ui field">
						<label>
							起始周：
							<WeekSelect get={begin_week} set={set_begin_week} classList={{ red: begin_week() > end_week() }} />
						</label>
					</div>
					<div class="ui field">
						<label>
							结束周：
							<WeekSelect get={end_week} set={set_end_week} classList={{ red: begin_week() > end_week() }} />
						</label>
					</div>
				</div>
			</div>
			<div>
				<table class="ui celled table segment">
					<thead>
						{table.getHeaderGroups().map(headerGroup => (
							<tr>
								{headerGroup.headers.map(header => (
									<th>{flexRender(header.column.columnDef.header, header.getContext())}</th>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.map(row => (
							<tr>
								{row.getVisibleCells().map(cell => (
									<td>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
								))}
							</tr>
						))}
					</tbody>
					<tfoot>
						<tr>
							<td colspan={columns.length} style={{ "text-align": "center" }}>
								<button class="ui green icon button" onClick={append_row}>
									<i class="plus icon" />
								</button>
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
			<Calendar
				spares={spares()}
				rooms={rooms()}
				base_week={begin_week()} />
			<div class="ui segment" style={{ "text-align": "center" }}>
				<button class="ui button" onClick={submit}> 提交 </button>
				<ErrorMessage message={error()} />
			</div>
		</>
	)
}

export const Admin: Component = () => {
	return MenuViewer([
		{
			name: "用户管理",
			component: UserManage,
		},
		{
			name: "琴房管理",
			component: SpareManage,
		},
	])
}