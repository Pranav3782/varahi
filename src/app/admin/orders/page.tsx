"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function AdminOrdersPage() {
  const db = useFirestore();
  const ordersRef = useMemoFirebase(() => collection(db, 'orders'), [db]);
  const { data: orders, isLoading } = useCollection(ordersRef);
  const [filter, setFilter] = useState('All');

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-primary/10 text-primary';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Shipped': return 'bg-blue-100 text-blue-700';
      case 'Cancelled': return 'bg-destructive/10 text-destructive';
      case 'RTO': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const updateStatus = (orderId: string, newStatus: string) => {
    updateDocumentNonBlocking(doc(db, 'orders', orderId), {
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
  };

  if (isLoading) {
    return <div className="min-h-[400px] flex items-center justify-center font-headline text-2xl font-extrabold text-primary animate-pulse">Synchronizing Orders...</div>;
  }

  const filteredOrders = orders?.filter(o => filter === 'All' || o.status === filter) || [];

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-[#100C06]">Order Management</h1>
          <p className="text-[#7A6848] text-sm mt-2 font-medium">Real-time monitoring of all Vivaan Farms transactions.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-[300px]">
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[#7A6848] text-sm"></i>
            <Input 
              placeholder="Search by ID or customer..." 
              className="h-12 pl-11 rounded-2xl bg-white border-[#DDD0B5] focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {['All', 'Pending', 'Shipped', 'Delivered', 'Cancelled', 'RTO'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              "h-11 px-6 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
              filter === tab ? "bg-primary text-white shadow-lg scale-105" : "bg-white text-[#7A6848] border border-[#DDD0B5]/50 shadow-sm"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3">
          <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#F9F6EF]">
                <TableRow className="border-b-[#DDD0B5]/30">
                  <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-[#7A6848]">Order ID</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-[#7A6848]">Customer</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-[#7A6848]">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-[#7A6848]">Payment</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-[#7A6848]">Total</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-[#7A6848]">Date</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-[#7A6848] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                  <TableRow key={order.id} className="border-b-[#DDD0B5]/20 hover:bg-primary/[0.02] transition-colors cursor-pointer group">
                    <TableCell className="py-6 px-8 text-sm font-black text-primary">#{order.id.substring(0, 8).toUpperCase()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-[10px] font-black text-secondary">
                          {order.userId?.substring(0, 2).toUpperCase() || 'CU'}
                        </div>
                        <span className="text-sm font-bold text-foreground">User ID: {order.userId?.substring(0, 6)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", getStatusStyle(order.status))}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-[#7A6848]">{order.paymentMethod}</TableCell>
                    <TableCell className="text-sm font-black text-foreground">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-sm font-medium text-[#7A6848]">{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-right pr-8">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-8 h-8 rounded-xl bg-[#F9F6EF] flex items-center justify-center text-[#7A6848] hover:bg-primary/10 hover:text-primary transition-all">
                            <i className="fa-solid fa-ellipsis-v text-xs"></i>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl p-2 border-none shadow-2xl min-w-[180px]">
                          <DropdownMenuItem onClick={() => updateStatus(order.id, 'Shipped')} className="rounded-xl py-2.5 px-4 text-xs font-bold cursor-pointer hover:bg-primary/5">
                            <i className="fa-solid fa-truck mr-2 text-primary"></i> Mark Shipped
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(order.id, 'Delivered')} className="rounded-xl py-2.5 px-4 text-xs font-bold cursor-pointer hover:bg-primary/5">
                            <i className="fa-solid fa-check-double mr-2 text-primary"></i> Mark Delivered
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(order.id, 'RTO')} className="rounded-xl py-2.5 px-4 text-xs font-bold cursor-pointer hover:bg-orange-50 text-orange-600">
                            <i className="fa-solid fa-rotate-left mr-2"></i> Mark RTO
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(order.id, 'Cancelled')} className="rounded-xl py-2.5 px-4 text-xs font-bold cursor-pointer hover:bg-red-50 text-red-600">
                            <i className="fa-solid fa-ban mr-2"></i> Cancel Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-20 text-center text-[#7A6848] font-medium italic">
                      No orders found matching the filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-xl rounded-[40px] p-8">
            <CardHeader className="p-0 mb-8">
              <CardTitle className="font-headline text-2xl font-extrabold">Order Summary</CardTitle>
            </CardHeader>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-sm font-bold">Total Orders</span>
                </div>
                <span className="text-sm font-black text-[#7A6848]">{orders?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-sm font-bold">RTO Orders</span>
                </div>
                <span className="text-sm font-black text-orange-600">{orders?.filter(o => o.status === 'RTO').length || 0}</span>
              </div>
            </div>
            <div className="mt-10 p-6 bg-[#F9F6EF] rounded-3xl text-center">
              <div className="text-[10px] font-black text-[#7A6848] uppercase tracking-[3px] mb-2">Total Revenue</div>
              <div className="font-headline text-3xl font-extrabold text-primary">
                ₹{orders?.reduce((acc, o) => acc + (o.totalAmount || 0), 0).toLocaleString('en-IN') || '0'}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
