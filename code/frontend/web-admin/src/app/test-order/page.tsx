'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { toast, Toaster } from 'sonner';
import { 
  ShoppingBag, Trash2, CheckCircle2, RefreshCw, 
  Search, Utensils, Hash, Clock, AlertTriangle, Play 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { API_BASE_URL } from '@/lib/constants';
import { tableService } from '@/services/table.service';
import type { Table } from '@/types/table';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string | null;
  imagesUrl: string[] | null;
  isRemain: boolean;
  categoryId: number;
  category: { id: number; name: string };
}

interface CartItem {
  item: MenuItem;
  quantity: number;
  note: string;
}

interface OrderResponse {
  id: number;
  tableId: string;
  trackingCode: string;
  status: 'NEW' | 'PREPARING' | 'SERVED' | 'PAID' | 'CANCEL';
  totalAmount: number;
  createdAt: string;
}

function Simulator() {
  const { data: session } = useSession();
  const token = session?.accessToken ?? null;

  // Tables & Items lists
  const [tables, setTables] = useState<Table[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  // Selection state
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Placed order tracking
  const [trackingCode, setTrackingCode] = useState<string>('');
  const [trackingOrder, setTrackingOrder] = useState<OrderResponse | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Fetch tables (if logged in)
  const fetchTables = useCallback(async () => {
    if (!token) return;
    setLoadingTables(true);
    try {
      const data = await tableService.getAll(token);
      setTables(data.filter(t => t.status === 'AVAILABLE' || t.status === 'OCCUPIED'));
    } catch (e) {
      console.error(e);
      toast.error('Không tải được danh sách bàn');
    } finally {
      setLoadingTables(false);
    }
  }, [token]);

  // Fetch available items
  const fetchItems = useCallback(async () => {
    setLoadingItems(true);
    try {
      // Fetch public customer items
      const res = await fetch(`${API_BASE_URL}/customer/items?limit=100`);
      if (!res.ok) throw new Error('Failed to fetch items');
      const json = await res.json();
      // Filter out-of-stock items as per Business Rule #1
      const availableItems = (json.data.items as MenuItem[]).filter(item => item.isRemain);
      setItems(availableItems);
    } catch (e) {
      console.error(e);
      toast.error('Không tải được danh sách món ăn');
    } finally {
      setLoadingItems(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (token) {
      fetchTables();
    }
  }, [token, fetchTables]);

  // WebSocket Connection
  useEffect(() => {
    const WS_URL = API_BASE_URL.replace('/api', '');
    const socketInstance = io(`${WS_URL}/orders`, { transports: ['websocket'] });

    socketInstance.on('connect', () => {
      setWsConnected(true);
      console.log('Connected to order namespace WS');
    });

    socketInstance.on('disconnect', () => {
      setWsConnected(false);
    });

    socketInstance.on('order:status-changed', (payload: { orderId: number; status: OrderResponse['status']; trackingCode: string }) => {
      setTrackingOrder(prev => {
        if (prev && prev.trackingCode === payload.trackingCode) {
          toast.info(`Trạng thái đơn hàng thay đổi thành: ${payload.status}`);
          return { ...prev, status: payload.status };
        }
        return prev;
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Join tracking room whenever trackingCode changes
  useEffect(() => {
    if (socket && trackingCode && wsConnected) {
      socket.emit('join-order-tracking', { trackingCode });
      console.log(`Joined tracking room for order: ${trackingCode}`);
    }
  }, [socket, trackingCode, wsConnected]);

  // Add to cart
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        return prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { item, quantity: 1, note: '' }];
    });
    toast.success(`Đã thêm ${item.name} vào giỏ hàng`);
  };

  const updateQuantity = (itemId: number, q: number) => {
    if (q <= 0) {
      setCart(prev => prev.filter(c => c.item.id !== itemId));
      return;
    }
    setCart(prev => prev.map(c => c.item.id === itemId ? { ...c, quantity: q } : c));
  };

  const updateNote = (itemId: number, note: string) => {
    setCart(prev => prev.map(c => c.item.id === itemId ? { ...c, note } : c));
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => prev.filter(c => c.item.id !== itemId));
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (!selectedTableId) {
      toast.error('Vui lòng chọn hoặc nhập mã bàn UUID!');
      return;
    }
    if (cart.length === 0) {
      toast.error('Giỏ hàng trống!');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const payload = {
        tableId: selectedTableId,
        items: cart.map(c => ({
          itemId: c.item.id,
          quantity: c.quantity,
          note: c.note || undefined
        }))
      };

      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Thất bại khi gọi API tạo đơn');
      }

      const orderData = json.data as OrderResponse;
      setTrackingCode(orderData.trackingCode);
      setTrackingOrder(orderData);
      setCart([]);
      toast.success('Đặt món thành công! Bạn có thể theo dõi đơn hàng phía bên phải.');
      
      // Auto register to WebSocket if connected
      if (socket && wsConnected) {
        socket.emit('join-order-tracking', { trackingCode: orderData.trackingCode });
      }
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Lỗi đặt hàng');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Track existing order manually
  const handleTrackExisting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = (e.currentTarget.elements.namedItem('trackCode') as HTMLInputElement).value.trim();
    if (!code) return;

    try {
      const res = await fetch(`${API_BASE_URL}/orders/track/${code}`);
      if (!res.ok) throw new Error('Không tìm thấy mã đơn hàng');
      const json = await res.json();
      setTrackingCode(code);
      setTrackingOrder(json.data);
      toast.success('Tìm thấy đơn hàng! Đang theo dõi.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi theo dõi đơn hàng');
    }
  };

  const totalCartAmount = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (i.description && i.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const statusColors: Record<string, string> = {
    NEW: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    PREPARING: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    SERVED: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
    PAID: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
    CANCEL: 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Upper Navigation / Decorative Banner */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/25">
            <Utensils className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-200 bg-clip-text text-transparent">
              F&B Order Simulator
            </h1>
            <p className="text-xs text-slate-400">Trình giả lập đặt món của khách hàng (Không cần đăng nhập)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <span className={`inline-block size-2 rounded-full ${wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            WS: {wsConnected ? 'Connected' : 'Disconnected'}
          </div>
          {session ? (
            <div className="text-xs text-slate-400">
              Đăng nhập với: <span className="font-semibold text-slate-200">{session.user?.email}</span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic">
              Chưa đăng nhập quản trị
            </div>
          )}
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        {/* Left/Middle Column (Items & Table Selector) */}
        <div className="xl:col-span-8 space-y-6 flex flex-col">
          {/* Table Configuration */}
          <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-md flex items-center gap-2 text-violet-400">
                <Hash className="size-4" /> 1. Chọn Bàn Giả Lập
              </CardTitle>
              <CardDescription className="text-slate-400">
                Khách hàng quét mã QR sẽ nhận được Table UUID. Chọn bàn trong danh sách (nếu đăng nhập) hoặc dán thủ công.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {token ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="table-select" className="text-xs text-slate-400 font-medium">Bàn trống/hoạt động hệ thống</Label>
                    {loadingTables ? (
                      <div className="h-10 flex items-center justify-center border border-dashed border-slate-800 rounded bg-slate-950/50 text-xs text-slate-500">
                        Đang tải danh sách bàn...
                      </div>
                    ) : (
                      <Select 
                        value={selectedTableId} 
                        onValueChange={(val) => {
                          setSelectedTableId(val ?? '');
                          if (val) {
                            toast.success(`Đã chọn bàn: ${tables.find(t => t.id === val)?.name || val}`);
                          }
                        }}
                      >
                        <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-100 h-10 w-full">
                          <span className="flex-1 truncate text-left text-sm">
                            {tables.find(t => t.id === selectedTableId)?.name ?? '-- Chọn một bàn từ hệ thống --'}
                          </span>
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                          {tables.map(t => (
                            <SelectItem key={t.id} value={t.id} className="focus:bg-slate-800 focus:text-white">
                              {t.name} (Sức chứa: {t.capacity}) - [{t.status}]
                            </SelectItem>
                          ))}
                          {tables.length === 0 && (
                            <div className="py-2 text-center text-xs text-slate-500">Không có bàn nào trống/mở</div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="table-uuid" className="text-xs text-slate-400 font-medium">Mã UUID Bàn (Tự động điền hoặc nhập)</Label>
                    <Input 
                      id="table-uuid"
                      value={selectedTableId}
                      onChange={(e) => setSelectedTableId(e.target.value)}
                      placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                      className="bg-slate-950 border-slate-800 text-slate-100 h-10 placeholder:text-slate-600"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg text-xs leading-relaxed">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>Bạn đang chạy ẩn danh. Đăng nhập trang quản trị để tải danh sách bàn. Hiện tại, bạn phải dán thủ công Table UUID của bàn để test.</span>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="table-uuid-anon" className="text-xs text-slate-400 font-medium">Dán mã Table UUID</Label>
                    <Input 
                      id="table-uuid-anon"
                      value={selectedTableId}
                      onChange={(e) => setSelectedTableId(e.target.value)}
                      placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                      className="bg-slate-950 border-slate-800 text-slate-100 h-10 placeholder:text-slate-600"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Menu Items Catalog */}
          <div className="flex-1 flex flex-col space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-md font-bold text-slate-300 flex items-center gap-2">
                <ShoppingBag className="size-4 text-violet-400" /> 2. Thực Đơn Món Ăn
              </h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                <Input 
                  placeholder="Tìm món ăn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-900 border-slate-800 pl-9 text-slate-100 h-9 placeholder:text-slate-500 text-sm"
                />
              </div>
            </div>

            {loadingItems ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500">
                <RefreshCw className="size-8 animate-spin text-violet-500 mb-3" />
                <span className="text-sm">Đang tải danh sách món ăn...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 border border-dashed border-slate-800 rounded-xl bg-slate-900/20 text-slate-500">
                <Utensils className="size-10 text-slate-700 mb-3" />
                <p className="text-sm">Không tìm thấy món ăn nào</p>
                <p className="text-xs text-slate-600 mt-1">Vui lòng kiểm tra lại seed dữ liệu hoặc bộ lọc tìm kiếm.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map(item => (
                  <Card key={item.id} className="bg-slate-900 border-slate-800 text-slate-100 shadow-md hover:border-slate-700 transition flex flex-col justify-between overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-sm font-bold text-slate-200 line-clamp-1">{item.name}</CardTitle>
                        <span className="text-xs font-semibold text-violet-400 px-2 py-0.5 rounded bg-violet-500/10 whitespace-nowrap">
                          {item.price.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                      <CardDescription className="text-slate-400 text-xs line-clamp-2 mt-1 min-h-[32px]">
                        {item.description || 'Chưa có mô tả chi tiết cho món ăn này.'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex justify-between items-center gap-4 mt-2">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        Mã món: #{item.id}
                      </span>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => addToCart(item)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs h-8"
                      >
                        Thêm vào đơn
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Cart & Tracker) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Cart Section */}
          <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl flex flex-col max-h-[600px]">
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-md flex items-center justify-between text-violet-400">
                <span className="flex items-center gap-2">🛒 Giỏ Hàng Chi Tiết</span>
                <span className="text-xs bg-slate-800 px-2.5 py-1 rounded-full text-slate-300 font-semibold">{cart.length} món</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1 divide-y divide-slate-800 min-h-[250px] max-h-[400px]">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-16 text-slate-500">
                  <ShoppingBag className="size-10 text-slate-700 mb-2" />
                  <span className="text-xs">Giỏ hàng đang trống.</span>
                  <span className="text-[10px] text-slate-600 mt-1">Chọn món ở danh sách bên cạnh.</span>
                </div>
              ) : (
                cart.map(c => (
                  <div key={c.item.id} className="p-4 space-y-2 hover:bg-slate-800/20 transition">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{c.item.name}</h4>
                        <span className="text-[10px] text-slate-400">
                          {c.item.price.toLocaleString('vi-VN')} đ / phần
                        </span>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => removeFromCart(c.item.id)}
                        className="size-7 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-full"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-1">
                      {/* Note Input */}
                      <Input 
                        placeholder="Ghi chú món ăn..."
                        value={c.note}
                        onChange={(e) => updateNote(c.item.id, e.target.value)}
                        className="bg-slate-950 border-slate-800 text-xs h-7 w-full placeholder:text-slate-600"
                      />

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-1 shrink-0 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                        <button 
                          onClick={() => updateQuantity(c.item.id, c.quantity - 1)}
                          className="size-6 text-slate-400 hover:text-white rounded"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-200">
                          {c.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(c.item.id, c.quantity + 1)}
                          className="size-6 text-slate-400 hover:text-white rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-4">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-400">Tổng cộng:</span>
                  <span className="text-violet-400 text-lg font-bold">{totalCartAmount.toLocaleString('vi-VN')} đ</span>
                </div>
                <Button 
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold h-10 border-0"
                >
                  {isPlacingOrder ? (
                    <>
                      <RefreshCw className="size-4 animate-spin mr-2" /> Đang tạo đơn...
                    </>
                  ) : (
                    <>Đặt đơn món ăn</>
                  )}
                </Button>
              </div>
            )}
          </Card>

          {/* Tracker Section */}
          <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-md flex items-center gap-2 text-violet-400">
                <Clock className="size-4" /> 🛰️ Theo Dõi Đơn Hàng (Real-time)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Tracker Form */}
              <form onSubmit={handleTrackExisting} className="flex gap-2">
                <Input 
                  name="trackCode"
                  placeholder="Nhập mã Tracking Code (UUID)..."
                  className="bg-slate-950 border-slate-800 text-slate-100 h-9 text-xs placeholder:text-slate-600"
                />
                <Button type="submit" size="sm" className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs h-9">
                  Dõi đơn
                </Button>
              </form>

              {trackingOrder ? (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-200">Đơn hàng #{trackingOrder.id}</span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${statusColors[trackingOrder.status] || 'bg-slate-800'}`}>
                      {trackingOrder.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mã theo dõi:</span>
                      <span className="font-mono text-slate-400 select-all">{trackingOrder.trackingCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mã Bàn:</span>
                      <span className="font-mono text-slate-400">{trackingOrder.tableId.slice(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Đặt lúc:</span>
                      <span className="text-slate-400">{new Date(trackingOrder.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-900 pt-1.5 font-bold">
                      <span className="text-slate-400">Tổng tiền:</span>
                      <span className="text-violet-400">{trackingOrder.totalAmount.toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>

                  {/* Status Progression Visual Indicator */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                      <span className={trackingOrder.status === 'NEW' ? 'text-blue-400' : ''}>Mới</span>
                      <span className={trackingOrder.status === 'PREPARING' ? 'text-amber-400' : ''}>Chế biến</span>
                      <span className={trackingOrder.status === 'SERVED' ? 'text-emerald-400' : ''}>Đã phục vụ</span>
                      <span className={trackingOrder.status === 'PAID' ? 'text-purple-400' : ''}>Đã thanh toán</span>
                    </div>
                    <div className="flex gap-1 mt-1">
                      {['NEW', 'PREPARING', 'SERVED', 'PAID'].map((step, idx) => {
                        const steps = ['NEW', 'PREPARING', 'SERVED', 'PAID'];
                        const currentIdx = steps.indexOf(trackingOrder.status);
                        const isDone = currentIdx >= idx;
                        const isCancel = trackingOrder.status === 'CANCEL';

                        let color = 'bg-slate-800';
                        if (isCancel) {
                          color = 'bg-rose-500/30';
                        } else if (isDone) {
                          if (step === 'NEW') color = 'bg-blue-500';
                          if (step === 'PREPARING') color = 'bg-amber-500';
                          if (step === 'SERVED') color = 'bg-emerald-500';
                          if (step === 'PAID') color = 'bg-purple-500';
                        }

                        return (
                          <div 
                            key={step} 
                            className={`h-1.5 flex-1 rounded-full ${color} transition-all duration-500`}
                          />
                        );
                      })}
                    </div>
                    {trackingOrder.status === 'CANCEL' && (
                      <p className="text-[10px] text-rose-500 font-semibold mt-2 text-center">
                        ⚠️ Đơn hàng này đã bị Hủy!
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500 italic">
                  Chưa có đơn hàng nào được theo dõi. Đặt đơn để tự động tracking ở đây.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export default function TestOrderPage() {
  return (
    <SessionProvider>
      <Simulator />
    </SessionProvider>
  );
}
