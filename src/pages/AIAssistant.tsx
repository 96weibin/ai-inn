import { useState } from 'react';
import { Card, Input, Button, List, Avatar, Spin, Tag } from 'antd';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { id: '1', role: 'system', content: '您好！我是AI-Inn智能助手，请问有什么可以帮助您的？', type: 'text' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    setMessages([...messages, { id: Date.now().toString(), role: 'user', content: inputValue, type: 'text' }]);
    setInputValue('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = generateResponse(inputValue);
    setMessages([...messages, { id: Date.now().toString(), role: 'user', content: inputValue, type: 'text' }, response]);
    setIsLoading(false);
  };

  const generateResponse = (message: string): typeof messages[0] => {
    if (message.includes('入住') || message.includes('办理入住')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: '好的！请问客人姓名和房间号是多少？',
        type: 'text',
      };
    }

    if (message.includes('退房') || message.includes('办理退房')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: '好的！请问要退房的房间号是多少？',
        type: 'text',
      };
    }

    if (message.includes('续房') || message.includes('延长')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: '好的！请问是哪个房间要续房？续到什么时候？',
        type: 'text',
      };
    }

    if (message.includes('排房') || message.includes('安排房间')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: '我来帮您分析可用房间。当前有以下房间可选：\n\n101室 - 单间 - 空闲\n104室 - 单间 - 空闲\n202室 - 双人间 - 空闲\n301室 - 套房 - 空闲\n\n请问您希望安排哪种房型？',
        type: 'text',
      };
    }

    if (message.includes('房间状态') || message.includes('房态')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: '当前房态概览：\n\n- 空闲房间：12间\n- 入住中：28间\n- 打扫中：6间\n- 维修中：4间\n\n需要查看具体楼层的房间状态吗？',
        type: 'text',
      };
    }

    if (message.includes('今天') || message.includes('今日')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: '今日概览：\n\n- 今日入住：8人\n- 今日退房：5人\n- 今日营收：12,800元\n- 入住率：76%\n\n需要了解更多详情吗？',
        type: 'text',
      };
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: `我理解您说的：\"${message}\"\n\n我可以帮您处理以下操作：\n\n• 办理入住\n• 办理退房\n• 续房处理\n• 智能排房\n• 房态查询\n\n请问您需要什么帮助？`,
      type: 'text',
    };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <Card title="AI智能助手" style={{ height: 'calc(100vh - 200px)' }}>
      <div style={{ height: 'calc(100% - 80px)', overflowY: 'auto', marginBottom: 16 }}>
        <List
          dataSource={messages}
          renderItem={(item) => (
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <Avatar
                style={{ 
                  backgroundColor: item.role === 'user' ? '#1890ff' : '#52c41a',
                  alignSelf: 'flex-start'
                }}
              >
                {item.role === 'user' ? '您' : 'AI'}
              </Avatar>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                  {item.role === 'user' ? '您' : 'AI助手'}
                </div>
                <div style={{ 
                  background: item.role === 'user' ? '#1890ff' : '#f0f0f0',
                  color: item.role === 'user' ? '#fff' : '#333',
                  padding: 12,
                  borderRadius: 8,
                  whiteSpace: 'pre-wrap',
                }}>
                  {item.content}
                </div>
              </div>
            </div>
          )}
        />
        {isLoading && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <Avatar style={{ backgroundColor: '#52c41a', alignSelf: 'flex-start' }}>AI</Avatar>
            <div style={{ background: '#f0f0f0', padding: 12, borderRadius: 8 }}>
              <Spin size="small" />
            </div>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入您的问题，例如：帮我安排一个房间"
          style={{ flex: 1 }}
        />
        <Button type="primary" onClick={handleSend}>
          发送
        </Button>
      </div>
    </Card>
  );
};

export default AIAssistant;
