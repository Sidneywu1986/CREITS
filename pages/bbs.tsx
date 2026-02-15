import MainLayout from '../src/components/layout/MainLayout';
import HackerAnonymousBBS from '../src/components/bbs/HackerAnonymousBBS';

export default function BBSPage() {
  return (
    <MainLayout>
      <div className="p-8">
        <HackerAnonymousBBS />
      </div>
    </MainLayout>
  );
}
