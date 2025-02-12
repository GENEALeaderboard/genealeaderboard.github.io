import { Table, Td, Th, Tr } from "@/nextra"
import React from "react"

export default function User({ user, index }) {
  console.log(user)
  return (
    <Tr>
      <Td>{index + 1}</Td>
      <Td align="center">{user.name}</Td>
      <Td align="center">{user.pages.length}</Td>
      <Td align="center">{user.status}</Td>
    </Tr>
  )
}
