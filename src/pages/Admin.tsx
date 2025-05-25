import { Component, createMemo, createResource, createSignal } from "solid-js"
import { MenuViewer } from "../lib/MenuViewer"
import { LinkButton, ResourceLoader, SubmitField, SubmitStatus } from "../lib/common"
import { ColumnDef, createSolidTable, flexRender, getCoreRowModel, getPaginationRowModel, Table } from "@tanstack/solid-table"
import { api, Role, Room, Spare, SpareInitRequest, UserFulls, UserSetResponse } from "../api"
import { WeekSelect } from "../lib/WeekSelect"
import { addDays, addWeeks, format, formatDate, formatISODuration, intervalToDuration, parse } from "date-fns"
import { match } from "ts-pattern"
import { Signal, spare_end_time, spare_start_time } from "../util"
import { Calendar, SpareDefaultTd } from "../component/Calendar"
import { zhCN } from "date-fns/locale"

const TanstackTableContent = <T,>(props: { table: Table<T> }) => <>
	<thead>
		{props.table.getHeaderGroups().map(headerGroup => (
			<tr>
				{headerGroup.headers.map(header => (
					<th>{flexRender(header.column.columnDef.header, header.getContext())}</th>
				))}
			</tr>
		))}
	</thead>
	<tbody>
		{props.table.getRowModel().rows.map(row => (
			<tr>
				{row.getVisibleCells().map(cell => (
					<td>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
				))}
			</tr>
		))}
	</tbody>
</>

const UserListManage = (users: UserFulls) => {
	const role_list: Role["type"][] = ["admin", "user", "terminal"] // [Reminder] update this when new roles are added

	// part: form data
	type UserInput = {
		id: number;
		username: string;
		roles: Map<Role["type"], Signal<boolean>>;
		roles_updated: boolean;
		password: Signal<string | undefined>;
	}
	const users_input: UserInput[] = users.map(user => ({
		id: user.id,
		username: user.username,
		roles: new Map<Role["type"], Signal<boolean>>(
			role_list.map(role => [role, new Signal<boolean>(user.roles.some(r => r.type === role))])
		),
		roles_updated: false,
		password: new Signal<string | undefined>(undefined),
	}))

	// part: handlers
	const toggle_role = (user: UserInput, role: Role["type"]) => {
		console.log(user.id, role)
		user.roles.get(role)!.set(x => !x)
		user.roles_updated = true
	}
	const submit = async () => {
		const responses: Promise<UserSetResponse>[] = []
		users_input.forEach(user => {
			if (user.roles_updated) {
				responses.push(api.user_set({
					user_id: user.id,
					operation: {
						type: "roles",
						content: user.roles.entries().flatMap(([role, value]) => value.get() ? [{ type: role }] : []).toArray(),
					},
				}))
			}
			const password = user.password.get()
			if (password !== undefined) {
				responses.push(api.user_set({
					user_id: user.id,
					operation: { type: "password", content: password }
				}))
			}
		})
		await Promise.all(responses)
		return "修改成功"
	}
	const status = new SubmitStatus(submit)

	// part: table
	// create a table of users, using tanstack table
	// with columns: id, username, (set) roles, (set) password
	const columns: ColumnDef<UserInput>[] = [
		{
			header: "编号",
			accessorKey: "id",
			cell: ({ getValue }) => (
				<div> {getValue() as string} </div>
			),
		},
		{
			header: "用户名",
			accessorKey: "username",
			cell: ({ getValue }) => (
				<div> {getValue() as string} </div>
			),
		},
		{
			header: "角色",
			accessorKey: "roles",
			cell: ({ row }) => (
				row.original.roles.entries().map(([role, value]) => (
					<button class="ui right icon button tiny"
						onClick={() => toggle_role(row.original, role)}
						classList={{ green: value.get() }}>
						{role}
					</button>
				)).toArray()
			),
		},
		{
			header: "密码",
			accessorKey: "password",
			cell: ({ row }) => (
				<div class="ui basic input">
					<input type="password"
						value={row.original.password.get() ?? ""}
						onChange={e => row.original.password.set(e.currentTarget.value)} />
				</div>
			),
		}
	]

	const table = createSolidTable({
		get data() {
			return users_input
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	})

	// part: HTML
	return (
		<>
			<h4> 用户管理 </h4>
			<div>
				<table class="ui celled table segment">
					<TanstackTableContent table={table} />
					<tfoot>
						<tr>
							<td colspan={columns.length}>
								<div class="ui right floated pagination menu">
									<LinkButton class="icon item" label={<i class="left chevron icon"></i>}
										classList={{ disabled: !table.getCanPreviousPage() }}
										onClick={() => table.previousPage()} />
									<a class="item">
										第 {table.getState().pagination.pageIndex + 1} 页，
										共 {table.getPageCount()} 页
									</a>
									<LinkButton class="icon item" label={<i class="right chevron icon"></i>}
										classList={{ disabled: !table.getCanNextPage() }}
										onClick={() => table.nextPage()} />
								</div>
								<SubmitField {...status} />
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
		</>
	)
}

const UserManage: Component = () => {
	const [users] = createResource(async () => (await api.users_list({})).users)
	return (
		<ResourceLoader resource={users} render={UserListManage} />
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
				assignee: null,
			} as Spare)))
	})
	const rooms = createMemo(() => (
		[...new Set(spares_input().map(spare => spare.room.get()))]
	))

	// part: handlers

	const submit = async () => {
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
		const resp = await api.spare_init(data)
		return match(resp.type)
			.with("Success", () => "提交成功")
			.exhaustive()
	}
	const status = new SubmitStatus(submit)

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
			{/* Week selector */}
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
			{/* Input table */}
			<div>
				<table class="ui celled table segment">
					<TanstackTableContent table={table} />
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
			{/* Preview and submit */}
			<Calendar
				spares={spares()}
				rooms={rooms()}
				cell={SpareDefaultTd()} />
			<div class="ui horizontal divider" />
			<SubmitField {...status} />
		</>
	)
}

const SpareListManage = () => {
	const week = new Signal(new Date())
	const [data] = createResource(week.get, async (week) => ({
		spares: (await api.spare_list({
			type: "Week",
			content: format(week, "RRRR-'W'II"),
		})).spares,
		users: (await api.users_list({})).users,
	}))



	const render = ({ spares, users }: { spares: Spare[], users: UserFulls }) => {
		const columns: ColumnDef<Spare>[] = [
			{
				header: "琴房号",
				cell: ({ row }) => (
					row.original.room
				),
			},
			{
				header: "日期",
				cell: ({ row }) => (
					formatDate(spare_start_time(row.original), "LLLdo EEEE", { locale: zhCN })
				),
			},
			{
				header: "开始时间",
				cell: ({ row }) => (
					format(spare_start_time(row.original), "H:mm", { locale: zhCN })
				),
			},
			{
				header: "结束时间",
				cell: ({ row }) => (
					format(spare_end_time(row.original), "H:mm", { locale: zhCN })
				),
			},
			{
				header: "预约人",
				cell: ({ row }) => (
					<select class="ui search dropdown"
						onChange={async e => {
							await api.spare_set_assignee({
								id: row.original.id,
								assignee: match(e.currentTarget.value)
									.with("", () => null)
									.otherwise(id => users.find(user => user.id === parseInt(id)) ?? null),
							})
						}}>
						<option value=""> 不分配 </option>
						{users.map(user => (
							<option value={user.id} selected={row.original.assignee?.id === user.id}>
								{user.username}
							</option>
						))}
					</select>
				),
			},
		]
		const table = createSolidTable({
			get data() {
				return spares
			},
			columns,
			getCoreRowModel: getCoreRowModel(),
		})

		return (
			<div>
				<table class="ui celled table segment">
					<TanstackTableContent table={table} />
				</table>
			</div >
		)
	}

	return (
		<div class="ui form">
			<div class="ui field">
				<label>
					选择周：
				</label>
				<WeekSelect get={week.get} set={week.set} />
			</div>
			<ResourceLoader resource={data} render={render} />
		</div>
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
		{
			name: "琴表管理",
			component: SpareListManage,
		}
	])
}
