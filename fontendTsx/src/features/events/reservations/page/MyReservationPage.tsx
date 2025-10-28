
import React,{ useEffect, useMemo, useState } from 'react'
import { Loader2, Plus, Search } from 'lucide-react'
import { ReservationService } from '@/service/ReservationService'
import EventCard from '../../components/EventCard'
import { useNavigate } from 'react-router-dom'
import { usePagination } from '@/hooks/usePagination'


export default function MyReservationPage() {
  const navigate = useNavigate()
  const [loading,setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [reservations, setReservations] = useState([])
  const service = ReservationService()
  const fetchMyReservations = async ()=>{
    try {
        const res = await service.getMyReservations()
        const reservedEvents = Array.from(
        new Map(
            (res.reservations || []).map(r => [
            r.id,
            {
                ...r.event, // ✅ full deep clone
                reservation_id: r.id,
                reservation_status: r.statut,
                payment_status: r.statut_paiement,
                quantity: r.quantity,
                total_price: r.total_price,
                can_cancel: r.peut_annuler,
                reservation_date: r.date_reservation,
            },
            ])
        ).values()
        );
        setReservations(reservedEvents)
        
    } catch (error) {

        console.log(error)
        
    }finally{
        setLoading(false)
    }
  }
  useEffect(() => {
    fetchMyReservations()
    
  }, [])

  const hadnelCancel = async (id)=>{
    setLoading(true)
    try {
      await service.cancelReservation(id)
      setReservations(prev => prev.filter(r => r.id !== id))
    } catch (error) {
      console.log(error)
      
    }finally{
      setLoading(false)
    }

  }

  // Categories for filter
   const categories = useMemo(
    () => [...new Set(reservations.map(e => e.categorie?.name).filter(Boolean))],
    [reservations]
  )
   // Categories for filter
   const status = useMemo(
    () => [...new Set(reservations.map(e => e.payment_status).filter(Boolean))],
    [reservations]
  )
 const filteredEvents = useMemo(() => {
    // ✅ Additional safeguard: deduplicate by reservation_id
    const filtered = reservations.filter(e => {
      const matchesCategory = !selectedCategory || e.categorie?.name === selectedCategory;
      const matchesStatus = !selectedStatus || e.payment_status === selectedStatus;
      const matchesSearch =
        e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.localisation?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch &&matchesStatus;
    });
    
    // ✅ Final deduplication by reservation_id
    return Array.from(
      new Map(filtered.map(event => [event.reservation_id, event])).values()
    );
  }, [reservations, selectedCategory,selectedStatus, searchTerm]);

      const { currentData: paginatedEvents, currentPage, totalPages, nextPage, prevPage, goToPage, setCurrentPage } = usePagination(filteredEvents, 6)
    
        useEffect(() => {
        setCurrentPage(1)
      }, [filteredEvents, setCurrentPage])

  return (
    <>
      {/* Tabs + Filter */}
      <div className="space-y-4 sticky top-[76px] backdrop-blur-xl rounded-b-[8px] z-30 bg-white shadow-sm">
        {/* Tabs */}
        

        {/* Search + Category + Add Button */}
        <div className="flex flex-col sm:flex-row gap-3 px-4 py-2">
          {/* Search */}
          <div className="flex items-center flex-1 border border-gray-300 rounded-lg px-2 py-1">
            <Search className="text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un événement..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full focus:outline-none px-2 text-sm"
            />
          </div>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* status */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Touts les status</option>
            {status.map(statu => (
              <option key={statu} value={statu}>
                {statu}
              </option>
            ))}
          </select>
          <button
            onClick={()=>navigate('/dashboard/refunds-request')}
            
            className="flex items-center gap-2 bg-accent text-white px-3 py-2 rounded-lg hover:bg-primary"
          >
            <Plus className="w-4 h-4" /> Demander Un Remboursement
          </button>
        </div>
      </div>

      {/* Event List */}
      <div className="px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : paginatedEvents.length === 0 ? (
          <p className="text-center text-gray-500">Aucun événement trouvé.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedEvents.map(e => (
              <EventCard key={e.reservation_id} event={e} isReservation={true} onCancelReservation={hadnelCancel}  />
            ))}
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={prevPage} disabled={currentPage === 1} className="px-3 py-1 border rounded">
            Prev
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToPage(idx + 1)}
              className={`px-3 py-1 border rounded ${currentPage === idx + 1 ? 'bg-accent text-white' : ''}`}
            >
              {idx + 1}
            </button>
          ))}
          <button onClick={nextPage} disabled={currentPage === totalPages} className="px-3 py-1 border rounded">
            Next
          </button>
        </div>
      )}

    
    </>
  )
}
