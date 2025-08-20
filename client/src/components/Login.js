import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Car, Users } from 'lucide-react';

const Login = () => {
  const [matricula, setMatricula] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!matricula || !senha) {
      return;
    }

    setLoading(true);
    const success = await login(matricula, senha);
    
    if (success) {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Cabeçalho */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sistema de Abordagens
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Faça login para acessar o sistema
          </p>
        </div>

        {/* Formulário de Login */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="matricula" className="block text-sm font-medium text-gray-700 mb-2">
                Número de Matrícula
              </label>
              <input
                id="matricula"
                name="matricula"
                type="text"
                required
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className="input-field"
                placeholder="Digite sua matrícula"
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input-field"
                placeholder="Digite sua senha"
                autoComplete="current-password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Entrar no Sistema'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Informações do Sistema */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Funcionalidades do Sistema
          </h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <Car className="h-4 w-4 text-blue-600 mr-3" />
              Registro de abordagens de trânsito
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 text-green-600 mr-3" />
              Gerenciamento de blitz e participantes
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Shield className="h-4 w-4 text-purple-600 mr-3" />
              Sistema seguro com controle de acesso
            </div>
          </div>
        </div>

        {/* Informações de Acesso */}
        <div className="text-center text-xs text-gray-500">
          <p>Para suporte técnico, entre em contato com a administração</p>
          <p className="mt-1">Sistema desenvolvido para controle de abordagens de trânsito</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
