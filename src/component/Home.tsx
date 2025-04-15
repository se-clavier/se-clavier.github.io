import { Component } from "solid-js"
import { db } from "../db"
import { match } from "ts-pattern"

export const Home: Component = () => {

	return (
		<div> {
			match(db.user.get())
				.with(null, () => "请先登录" )
				.otherwise(() => (
					<div class="ui container">
						<p> 这是一个琴房预约系统 </p>
						<p> 你可以在这里预约琴房，查看预约记录 </p>
						<p> 你也可以在这里修改密码 </p>
						<p> 你还可以在这里查看其他用户的预约记录 </p>
						<p> 你还可以在这里查看其他用户的信息 </p>
					</div>
				))
		}	</div>
	)
}