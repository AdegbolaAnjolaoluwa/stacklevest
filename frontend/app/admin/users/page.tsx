"use client";

import { useState } from "react";
import { UserPlus, Search, MoreVertical, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AddUserDialog } from "../../../components/admin/add-user-dialog";

// Mock Data
const initialUsers = [
  { id: 1, name: "Alex Rivera", email: "alex@stacklevest.com", role: "ADMIN", status: "ACTIVE", avatar: "" },
  { id: 2, name: "Sam Chen", email: "sam@stacklevest.com", role: "MANAGER", status: "ACTIVE", avatar: "" },
  { id: 3, name: "Jordan Smith", email: "jordan@stacklevest.com", role: "MEMBER", status: "INACTIVE", avatar: "" },
  { id: 4, name: "Taylor Koxxi", email: "taylor@stacklevest.com", role: "MEMBER", status: "ACTIVE", avatar: "" },
  { id: 5, name: "Morgan Lee", email: "morgan@stacklevest.com", role: "MANAGER", status: "PENDING", avatar: "" },
];

export default function UserManagementPage() {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = (newUser: any) => {
    setUsers([...users, { ...newUser, id: users.length + 1 }]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1">Manage team members, roles, and account access levels.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="gap-2 text-slate-600 border-slate-200">
             <Download className="w-4 h-4" />
             Export CSV
           </Button>
           <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddUserOpen(true)}>
             <UserPlus className="w-4 h-4" />
             Add New User
           </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
         <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search users..." 
                className="pl-9 bg-slate-50 border-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
         </div>
         <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button variant="ghost" size="sm" className="text-slate-500 gap-2">
              Status: All
              <Filter className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-500 gap-2">
              Role: All
              <Filter className="w-3 h-3" />
            </Button>
            <span className="text-xs text-slate-400">Showing {filteredUsers.length} members</span>
         </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[300px] text-xs uppercase tracking-wider font-semibold text-slate-500">User</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-slate-500">Email Address</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-slate-500">Role</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-slate-500">Status</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wider font-semibold text-slate-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-slate-50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-slate-900">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-500">{user.email}</TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary" 
                    className={`
                      ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' : ''}
                      ${user.role === 'MANAGER' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : ''}
                      ${user.role === 'MEMBER' ? 'bg-slate-100 text-slate-700 hover:bg-slate-100' : ''}
                      border-none font-semibold text-[10px] px-2 py-0.5
                    `}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-2">
                     <div className={`w-1.5 h-1.5 rounded-full ${
                       user.status === 'ACTIVE' ? 'bg-green-500' :
                       user.status === 'INACTIVE' ? 'bg-slate-300' :
                       'bg-orange-400'
                     }`} />
                     <span className={`text-xs font-medium ${
                       user.status === 'ACTIVE' ? 'text-green-700' :
                       user.status === 'INACTIVE' ? 'text-slate-500' :
                       'text-orange-600'
                     }`}>
                       {user.status}
                     </span>
                   </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit Details</DropdownMenuItem>
                      <DropdownMenuItem>Change Role</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">Remove User</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Pagination Placeholder */}
        <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-center bg-slate-50">
           <div className="flex gap-1">
             <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>&lt;</Button>
             <Button variant="default" size="sm" className="h-8 w-8 p-0 bg-blue-600">1</Button>
             <Button variant="outline" size="sm" className="h-8 w-8 p-0">2</Button>
             <Button variant="outline" size="sm" className="h-8 w-8 p-0">3</Button>
             <Button variant="outline" size="sm" className="h-8 w-8 p-0">&gt;</Button>
           </div>
        </div>
      </div>

      <AddUserDialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen} onUserAdd={handleAddUser} />
    </div>
  );
}
