import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Car, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  Eye, 
  FileText,
  Filter,
  Search,
  ChevronRight
} from 'lucide-react';

const BlitzManager = () => {
  const [blitz, setBlitz] = useState([]);
  const [blitzAtivas, setBlitzAtivas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todas'); // todas, ativas, encerradas
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBlitz();
  }, []);

  const fetchBlitz = async () => {
    try {
      setLoading(true);
      const [todasBlitzResponse, ativasResponse] = await Promise.all([
        axios.get('/api/blitz'),
        axios.get('/api/blitz/ativas')
      ]);
      
      setBlitz(todasBlitzResponse.data);
      setBlitzAtivas(ativasResponse.data);
    } catch (error) {
      console.error('Erro ao carregar blitz:', error);
      toast.error('Erro ao carregar blitz');
    } finally {
      setLoading(false);
    }
  };

  const filteredBlitz = blitz.filter(b => {
    const matchesFilter = filter === 'todas' || 
                         (filter === 'ativas' && b.ativa) || 
                         (filter === 'encerradas' && !b.ativa);
    
    const matchesSearch = !searchTerm || 
                         b.local.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         b.data.includes(searchTerm) ||
                         b.matriculasParticipantes.some(m => m.includes(searchTerm));
    
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (ativa) => {
    return ativa 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const BlitzCard = ({ blitz }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {blitz.local}
            </h3>
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(blitz.ativa)}`}>
              {blitz.ativa ? 'Ativa' : 'Encerrada'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-blue-500" />
              <span>{new Date(blitz.data).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-green-500" />
              <span>{blitz.hora}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-red-500" />
              <span className="truncate">{blitz.local}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-purple-500" />
              <span>{blitz.matriculasParticipantes.length} participantes</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 mb-4">
            <span className="font-medium">Participantes:</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {blitz.matriculasParticipantes.map((matricula, index) => (
                <span 
                  key={index}
                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                >
                  {matricula}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {blitz.ativa && (
          <Link
            to={`/abordagem/${blitz.id}`}
            className="btn-primary text-sm flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Registrar Abordagem
          </Link>
        )}
        
        <Link
          to={`/relatorio/${blitz.id}`}
          className="btn-secondary text-sm flex items-center"
        >
          <Eye className="h-4 w-4 mr-1" />
          Ver Detalhes
        </Link>
        
        <button
          onClick={() => window.open(`/api/admin/blitz/${blitz.id}/relatorio`, '_blank')}
          className="btn-secondary text-sm flex items-center"
        >
          <FileText className="h-4 w-4 mr-1" />
          Relatório PDF
        </button>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-12">
      <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Nenhuma blitz encontrada
      </h3>
      <p className="text-gray-500 mb-6">
        {filter === 'ativas' 
          ? 'Não há blitz ativas no momento'
          : filter === 'encerradas'
          ? 'Não há blitz encerradas'
          : searchTerm
          ? 'Nenhuma blitz corresponde à sua pesquisa'
          : 'Ainda não há blitz cadastradas no sistema'
        }
      </p>
      {filter === 'todas' && !searchTerm && (
        <Link to="/admin" className="btn-primary">
          Criar Primeira Blitz
        </Link>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciar Blitz
          </h1>
          <p className="text-gray-600 mt-1">
            Visualize e gerencie todas as operações de trânsito
          </p>
        </div>
        
        <Link to="/admin" className="btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Nova Blitz
        </Link>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Car className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Blitz</p>
              <p className="text-2xl font-bold text-gray-900">{blitz.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Blitz Ativas</p>
              <p className="text-2xl font-bold text-gray-900">{blitzAtivas.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Encerradas</p>
              <p className="text-2xl font-bold text-gray-900">{blitz.filter(b => !b.ativa).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Pesquisa */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar por local, data ou matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field w-auto"
            >
              <option value="todas">Todas</option>
              <option value="ativas">Ativas</option>
              <option value="encerradas">Encerradas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Blitz */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {filter === 'todas' ? 'Todas as Blitz' : 
             filter === 'ativas' ? 'Blitz Ativas' : 'Blitz Encerradas'}
            <span className="ml-2 text-sm text-gray-500">
              ({filteredBlitz.length} {filteredBlitz.length === 1 ? 'item' : 'itens'})
            </span>
          </h2>
        </div>
        
        <div className="p-6">
          {filteredBlitz.length > 0 ? (
            <div className="grid gap-6">
              {filteredBlitz.map((b) => (
                <BlitzCard key={b.id} blitz={b} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      {/* Blitz Ativas em Destaque */}
      {blitzAtivas.length > 0 && filter === 'todas' && (
        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-green-900">
              Blitz Ativas Agora
            </h2>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
              {blitzAtivas.length} ativa{blitzAtivas.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="grid gap-4">
            {blitzAtivas.slice(0, 3).map((b) => (
              <div key={b.id} className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{b.local}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(b.data).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {b.hora}
                      </span>
                    </div>
                  </div>
                  
                  <Link
                    to={`/abordagem/${b.id}`}
                    className="btn-primary text-sm flex items-center"
                  >
                    Registrar Abordagem
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlitzManager;
